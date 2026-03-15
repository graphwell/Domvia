"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { useToolAccess } from "@/hooks/use-tool-access";
import { rtdb } from "@/lib/firebase";
import { ref, push, set, remove, onValue, query, limitToLast } from "firebase/database";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/hooks/use-language";
import { 
    Loader2, CheckCircle2, History, ChevronLeft, Save, Edit2, Play, Pause, Camera,
    MapPin, Phone, MessageSquare, Trash2, Download, Printer
} from "lucide-react";
import Link from "next/link";
import { analyzeCaptureImage } from "@/lib/ai";
import { toast } from "sonner";
import { triggerHaptic } from "@/lib/haptic";
import { trackUsage } from "@/lib/usage-tracking";

// ── Compression Helper ──
function compressImage(base64Str: string, maxWidth = 1200, quality = 0.7): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round(height * (maxWidth / width));
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(base64Str); // Fallback
    });
}

// ── Geolocation & Reverse Geocoding Helpers ──
const getPosition = (): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
        if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
            resolve(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            (err) => {
                console.warn("Geolocation falhou ou bloqueada:", err);
                resolve(null);
            },
            { timeout: 8000, enableHighAccuracy: true }
        );
    });
};

const getAddressFromCoords = async (lat: number, lng: number): Promise<string | null> => {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: { 'Accept-Language': 'pt-BR' }
        });
        const data = await res.json();
        if (data && data.address) {
            const street = data.address.road || data.address.pedestrian || "";
            const neighborhood = data.address.suburb || data.address.neighbourhood || "";
            const city = data.address.city || data.address.town || "";
            return [street, neighborhood, city].filter(Boolean).join(", ");
        }
        return null;
    } catch (err) {
        console.warn("Reverse geocoding failed:", err);
        return null;
    }
};

interface Capture {
    id: string;
    imageUrl: string;
    phones: string[];
    timestamp: number;
    intent?: string;
    location?: {
        lat: number;
        lng: number;
        address?: string;
    };
    notes?: string;
}

export function CaptacaoClient() {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const toolAccess = useToolAccess("SMART_CAPTURE");
    const [captures, setCaptures] = useState<Capture[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [filterIntent, setFilterIntent] = useState<"todos" | "vende" | "aluga">("todos");

    // Current capture state
    const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
    const [detectedPhones, setDetectedPhones] = useState<string[]>([]);
    const [location, setLocation] = useState<{ lat: number, lng: number, address?: string } | null>(null);
    const [address, setAddress] = useState<string>("");
    const [intent, setIntent] = useState<string>("");
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [tempNote, setTempNote] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load history
    useEffect(() => {
        if (!user?.id) return;
        const capturesRef = query(ref(rtdb, `captures/${user.id}`), limitToLast(20));
        const unsub = onValue(capturesRef, (snap) => {
            const data = snap.val();
            if (data) {
                const list = Object.entries(data).map(([id, v]: [string, any]) => ({
                    id, ...v
                })).sort((a, b) => b.timestamp - a.timestamp);
                setCaptures(list);
            } else {
                setCaptures([]);
            }
            setHistoryLoading(false);
        });
        return () => unsub();
    }, [user?.id]);

    const handleStartCapture = () => {
        if (captures.length >= 20) {
            toast.error("Fila cheia (20 captações).", {
                description: "Por favor, exporte a planilha ou exclua registros antigos para continuar."
            });
            return;
        }
        
        if (fileInputRef.current) {
            triggerHaptic('medium');
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setIsCapturing(true);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const rawBase64 = event.target?.result as string;
            setCurrentPhoto(rawBase64);

            try {
                // Run compression and GPS concurrently
                const [base64, geoPos] = await Promise.all([
                    compressImage(rawBase64),
                    getPosition()
                ]);

                let captureLocation = location;
                
                if (geoPos) {
                    // Reverse geocode if getting new coordinates
                    const lat = geoPos.coords.latitude;
                    const lng = geoPos.coords.longitude;
                    const streetAddress = await getAddressFromCoords(lat, lng);
                    
                    captureLocation = { lat, lng, address: streetAddress || "" };
                    setLocation(captureLocation);
                    if (streetAddress) setAddress(streetAddress);
                }

                const result = await analyzeCaptureImage(base64);
                const validCaptures = (result.captures || []).filter(c => c.phones && c.phones.length > 0);

                if (validCaptures.length > 0 && user?.id) {
                    // Consume credit right before saving the batch
                    const consumed = await toolAccess.useTool("Captação Inteligente (OCR)");
                    if (!consumed) {
                        toast.error("Erro ao debitar crédito da captação.");
                        resetCapture();
                        return;
                    }

                    const capturesRef = ref(rtdb, `captures/${user.id}`);
                    
                    const savePromises = validCaptures.map(c => {
                        const finalAddress = captureLocation?.address || c.address || "";
                        const itemLocation = captureLocation ? { ...captureLocation, address: finalAddress } : { lat: 0, lng: 0, address: finalAddress };

                        const newRef = push(capturesRef);
                        return set(newRef, {
                            imageUrl: base64,
                            phones: c.phones,
                            intent: c.intent || null,
                            location: itemLocation,
                            timestamp: Date.now(),
                            notes: c.notes || ""
                        });
                    });

                    await Promise.all(savePromises);
                    trackUsage(user.id, "lead_captured", { source: "smart_capture", count: validCaptures.length });
                    toast.success(`${validCaptures.length} captaç${validCaptures.length > 1 ? 'ões' : 'ão'} salva${validCaptures.length > 1 ? 's' : ''} com sucesso!`);
                    resetCapture();
                    return;
                } else {
                    const debugInfo = result.captures?.[0]?.rawDebug || "Por favor, digite os dados manualmente.";
                    toast.error("Erro na leitura", {
                        description: `Nenhum telefone lido. ${debugInfo}`
                    });
                    return;
                }
            } catch (err) {
                console.error("AI Error:", err);
                toast.error("Processamento falhou.", {
                    description: "Sua foto é muito grande ou a conexão caiu. Tente novamente."
                });
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!user?.id || !currentPhoto) return;
        setIsSaving(true);
        try {
            const capturesRef = ref(rtdb, `captures/${user.id}`);
            const newRef = push(capturesRef);
            await set(newRef, {
                imageUrl: currentPhoto,
                phones: detectedPhones,
                intent: intent || null,
                location: location ? { ...location, address } : null,
                timestamp: Date.now(),
                notes
            });
            resetCapture();
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const resetCapture = () => {
        setCurrentPhoto(null);
        setDetectedPhones([]);
        setLocation(null);
        setAddress("");
        setIntent("");
        setNotes("");
        setIsCapturing(false);
        setIsProcessing(false);
    };
    
    const handleDelete = async (id: string) => {
        if (!user?.id || !confirm("Tem certeza que deseja excluir esta captação?")) return;
        try {
            await set(ref(rtdb, `captures/${user.id}/${id}`), null);
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const handleStartEditNote = (capture: Capture) => {
        setEditingNoteId(capture.id);
        setTempNote(capture.notes || "");
    };

    const handleSaveNote = async (id: string) => {
        if (!user?.id) return;
        try {
            await set(ref(rtdb, `captures/${user.id}/${id}/notes`), tempNote);
            setEditingNoteId(null);
        } catch (err) {
            console.error("Note save error:", err);
        }
    };

    const handleCall = async (phone: string, captureId: string) => {
        triggerHaptic('light');
        window.location.href = `tel:${phone.replace(/\D/g, '')}`;
        // Ask to archive after a small delay to allow the phone dialer to pop open
        setTimeout(async () => {
            if (window.confirm("Contato via Telefone iniciado! Deseja arquivar (limpar) esta captação do sistema?")) {
                if (user?.id) {
                    await remove(ref(rtdb, `captures/${user.id}/${captureId}`));
                    toast.success("Captação arquivada.");
                }
            }
        }, 1500);
    };

    const handleWhatsApp = async (phone: string, captureId: string) => {
        triggerHaptic('light');
        window.open(`https://wa.me/55${phone.replace(/\D/g, '')}`, "_blank");
        // Ask to archive after opening WhatsApp
        setTimeout(async () => {
            if (window.confirm("Contato via WhatsApp iniciado! Deseja arquivar (limpar) esta captação do sistema?")) {
                if (user?.id) {
                    await remove(ref(rtdb, `captures/${user.id}/${captureId}`));
                    toast.success("Captação arquivada.");
                }
            }
        }, 1500);
    };

    const handlePrint = () => {
        triggerHaptic('light');
        window.print();
    };

    const handleExportCSV = async () => {
        if (!user?.id || captures.length === 0) return;

        // Apply filters
        const filteredCaptures = captures.filter(c => {
            if (filterIntent === "todos") return true;
            if (!c.intent) return false;
            const rawIntent = c.intent.toLowerCase();
            if (filterIntent === "vende" && rawIntent.includes("vend")) return true;
            if (filterIntent === "aluga" && rawIntent.includes("alug")) return true;
            return false;
        });

        if (filteredCaptures.length === 0) {
            toast.info("Nenhuma captação para exportar com este filtro.");
            return;
        }

        // Generate CSV
        const headers = ["Data", "Telefones", "Intenção", "Endereço", "Observações"];
        const rows = filteredCaptures.map(c => {
            const date = new Date(c.timestamp).toLocaleString('pt-BR');
            const phones = c.phones.join(" | ");
            const intent = c.intent || "";
            const address = c.location?.address || `${c.location?.lat || ""}, ${c.location?.lng || ""}`;
            const notes = c.notes?.replace(/\n/g, " ") || "";
            // Escape quotes inside fields and wrap in quotes
            return `"${date}","${phones}","${intent}","${address.replace(/"/g, '""')}","${notes.replace(/"/g, '""')}"`;
        });

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        
        // Trigger Download
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `captacoes_domvia_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Confirmation to clear exported documents
        if (window.confirm("✨ Planilha baixada com sucesso! \n\nDeseja DELETAR estas captações exportadas do banco de dados para liberar espaço na sua fila?")) {
            try {
                // Delete them in parallel
                await Promise.all(
                    filteredCaptures.map(c => remove(ref(rtdb, `captures/${user.id}/${c.id}`)))
                );
                toast.success("Fila limpa com sucesso!");
            } catch (err) {
                console.error("Batch delete error:", err);
                toast.error("Erro ao limpar algumas captações.");
            }
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/tools">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 font-display">Captação Inteligente</h1>
                        <p className="text-slate-500 text-sm">Transforme fotos de placas em oportunidades</p>
                    </div>
                </div>
                {!isCapturing && (
                    <Button onClick={handleStartCapture} leftIcon={<Camera className="h-5 w-5" />} className="hidden sm:flex">
                        Nova Captação
                    </Button>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                className="hidden"
            />

            {isCapturing ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card padding="none" className="overflow-hidden border-2 border-brand-100 shadow-xl">
                        <div className="relative aspect-[4/3] bg-slate-900 flex items-center justify-center">
                            {currentPhoto && (
                                <img src={currentPhoto} alt="Capture" className="w-full h-full object-contain" />
                            )}
                            {isProcessing && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-3 p-6 text-center">
                                    <div className="p-4 bg-brand-500 rounded-full animate-bounce">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                    <p className="font-bold text-lg">Analisando Placa...</p>
                                    <p className="text-sm text-white/70">Nossa IA está identificando telefones e localização.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Phones Section */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5" />
                                    Telefones Identificados
                                </label>
                                {detectedPhones.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {detectedPhones.map((p, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 pr-4 shadow-sm group">
                                                <span className="font-mono font-bold text-slate-700">{p}</span>
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleCall(p, "draft")} className="p-1.5 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors">
                                                        <Phone className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleWhatsApp(p, "draft")} className="p-1.5 hover:bg-brand-100 text-brand-600 rounded-lg transition-colors">
                                                        <MessageSquare className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="ghost" size="sm" onClick={() => setDetectedPhones([...detectedPhones, ""])} className="text-slate-400 border-2 border-dashed border-slate-100 rounded-xl h-[46px]">
                                            <Edit2 className="h-4 w-4 mr-2" /> Editar/Add
                                        </Button>
                                    </div>
                                ) : !isProcessing ? (
                                    <p className="text-sm text-slate-400 italic">Nenhum telefone detectado automaticamente.</p>
                                ) : null}
                            </div>

                            {/* Location Section */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5" />
                                    Localização
                                </label>
                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className={`p-2 rounded-lg ${location ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400"}`}>
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={location ? "Aguardando endereço..." : "GPS desativado"}
                                        className="bg-transparent border-none focus:ring-0 text-sm flex-1 font-medium text-slate-700"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Observações</label>
                                <textarea
                                    placeholder="Ex: Apartamento no 3º andar, placa da imobiliária X..."
                                    className="w-full rounded-xl border-slate-200 text-sm min-h-[80px]"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" onClick={resetCapture} className="flex-1">Cancelar</Button>
                                <Button onClick={handleSave} loading={isSaving} className="flex-1 gap-2" leftIcon={<Save className="h-4 w-4" />}>
                                    Salvar Registro
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-700">
                    {/* Empty State / CTA */}
                    <div
                        onClick={() => {
                            triggerHaptic('medium');
                            handleStartCapture();
                        }}
                        className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-8 text-white text-center space-y-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-xl shadow-brand-500/20 active:scale-95 group"
                    >
                        <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto backdrop-blur-md group-hover:scale-110 transition-transform">
                            <Camera className="h-10 w-10" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black font-display">Toque para Fotografar</h2>
                            <p className="text-white/80 text-sm max-w-xs mx-auto">
                                No celular, este botão abre sua câmera instantaneamente.
                            </p>
                        </div>
                        <div className="pt-2 flex justify-center gap-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full">
                                <CheckCircle2 className="h-3.5 w-3.5" /> OCR Inteligente
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full">
                                <MapPin className="h-3.5 w-3.5" /> Auto GPS
                            </            {/* History */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
                    <h3 className="font-display font-bold text-slate-800 flex items-center gap-2">
                        <History className="h-5 w-5 text-slate-400" />
                        Minhas Captações
                        <Badge variant="outline" className="bg-slate-50 ml-2">{captures.length}/20</Badge>
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Filter Bar */}
                        {captures.length > 0 && (
                            <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
                                <button
                                    onClick={() => setFilterIntent("todos")}
                                    className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${filterIntent === "todos" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => setFilterIntent("vende")}
                                    className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${filterIntent === "vende" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    Venda
                                </button>
                                <button
                                    onClick={() => setFilterIntent("aluga")}
                                    className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${filterIntent === "aluga" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    Aluguel
                                </button>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {captures.length > 0 && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button size="sm" variant="outline" onClick={handlePrint} className="flex-1 sm:flex-none" leftIcon={<Printer className="h-4 w-4" />}>
                                    PDF
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleExportCSV} className="flex-1 sm:flex-none border-brand-200 text-brand-700 hover:bg-brand-50" leftIcon={<Download className="h-4 w-4" />}>
                                    Planilha
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                            </div>
                        </div>

                        {/* Mobile Export Button - Hide in print as we have unified buttons above */}
                        {captures.length > 0 && (
                            <Button size="sm" variant="outline" onClick={handleExportCSV} className="w-full sm:hidden flex border-brand-200 text-brand-700 hover:bg-brand-50 print:hidden">
                                Exportar para Planilha (CSV)
                            </Button>
                        )}

                        {historyLoading ? (
                            <div className="flex flex-col items-center py-12 gap-3 print:hidden">
                                <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
                                <p className="text-slate-500 text-sm">Carregando histórico...</p>
                            </div>
                        ) : captures.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 print:grid-cols-2">
                                {captures.filter(c => {
                                    if (filterIntent === "todos") return true;
                                    if (!c.intent) return false;
                                    const rawIntent = c.intent.toLowerCase();
                                    if (filterIntent === "vende" && rawIntent.includes("vend")) return true;
                                    if (filterIntent === "aluga" && rawIntent.includes("alug")) return true;
                                    return false;
                                }).map((cap) => (
                                    <Card key={cap.id} padding="none" className="overflow-hidden group hover:shadow-md transition-shadow border-slate-200 print:shadow-none">
                                        <div className="flex flex-col sm:flex-row">
                                            {/* Thumbnail */}
                                            <div className="w-full sm:w-48 aspect-video sm:aspect-square relative overflow-hidden bg-slate-100 shrink-0 print:w-32 print:h-32">
                                                <img src={cap.imageUrl} alt="Capture" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors print:hidden" />
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                                                <div className="space-y-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex flex-col gap-2">
                                                            {cap.intent && (
                                                                <span className={`inline-flex self-start uppercase text-xs px-2.5 py-1 font-black rounded-lg border ${cap.intent.toLowerCase().includes('vende') ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                                                                    {cap.intent}
                                                                </span>
                                                            )}
                                                            <div className="flex flex-wrap gap-2 items-center">
                                                                {cap.phones.length > 0 ? (
                                                                    cap.phones.map((p, i) => (
                                                                        <span key={i} className="text-sm font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5 shadow-sm">
                                                                            <Phone className="h-3 w-3 text-brand-500" />
                                                                            {p}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-xs text-slate-400 italic">Nenhum telefone</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1 shrink-0 print:hidden">
                                                            <button onClick={() => handleDelete(cap.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-1 text-[11px] text-slate-500 font-medium pt-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <History className="h-3 w-3" />
                                                            {new Date(cap.timestamp).toLocaleString('pt-BR', {
                                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </div>
                                                        {cap.location?.lat && (
                                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                                <MapPin className="h-3 w-3" />
                                                                <span className="truncate">{cap.location.address || `${cap.location.lat.toFixed(4)}, ${cap.location.lng.toFixed(4)}`}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Notes */}
                                                    <div className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                                        {editingNoteId === cap.id ? (
                                                            <div className="space-y-2 print:hidden">
                                                                <textarea
                                                                    className="w-full text-sm border-slate-200 rounded-lg p-2 focus:ring-brand-500"
                                                                    value={tempNote}
                                                                    onChange={(e) => setTempNote(e.target.value)}
                                                                    autoFocus
                                                                />
                                                                <div className="flex justify-end gap-2">
                                                                    <Button size="sm" variant="ghost" onClick={() => setEditingNoteId(null)}>Cancelar</Button>
                                                                    <Button size="sm" onClick={() => handleSaveNote(cap.id)}>Salvar</Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="group/note relative">
                                                                <p className={cap.notes ? "italic" : "text-slate-400 italic"}>
                                                                    {cap.notes || "Sem observações..."}
                                                                </p>
                                                                <button
                                                                    onClick={() => handleStartEditNote(cap)}
                                                                    className="absolute top-0 right-0 p-1 opacity-0 group-hover/note:opacity-100 text-brand-600 hover:bg-brand-50 rounded transition-all print:hidden"
                                                                >
                                                                    <Edit2 className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 print:hidden">
                                                    {cap.phones[0] ? (
                                                        <>
                                                            <Button size="sm" variant="secondary" onClick={() => handleWhatsApp(cap.phones[0], cap.id)} className="flex-1 gap-1.5 h-9 bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100">
                                                                <MessageSquare className="h-4 w-4" /> WhatsApp
                                                            </Button>
                                                            <Button size="sm" variant="secondary" onClick={() => handleCall(cap.phones[0], cap.id)} className="flex-1 gap-1.5 h-9 bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100">
                                                                <Phone className="h-4 w-4" /> Ligar
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button size="sm" variant="outline" disabled className="flex-1 h-9 opacity-50">Sem Telefone</Button>
                                                    )}
                                                    <Button size="sm" variant="ghost" onClick={() => handleStartEditNote(cap)} className="h-9 px-3 text-slate-500">
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 space-y-4">
                                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                    <History className="h-8 w-8 text-slate-200" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Nenhuma captação ainda</p>
                                    <p className="text-slate-500 text-sm">Suas fotos de placas aparecerão aqui.</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleStartCapture}>Começar Agora</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {toolAccess.ConfirmationModal}
        </div>
    );
}
