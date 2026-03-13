"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Camera, Plus, Trash2, Image as ImageIcon, CheckCircle2, AlertCircle, Coins, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { storage, rtdb } from "@/lib/firebase";
import { ref as dbRef, push, set } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/hooks/auth-provider";
import { optimizeImage } from "@/lib/image-optimizer";
import { uploadToCloudinary } from "@/lib/cloudinary";

import { useToolAccess } from "@/hooks/use-tool-access";
import { TOOL_CREDIT_COSTS } from "@/lib/billing";

interface RoomForm {
    id: string;
    label: string;
    imageFile: File | null;
    imageUrl: string;
    uploadProgress: number;
    status: "idle" | "uploading" | "done" | "error" | "optimizing";
    error?: string;
}

export default function NewTourPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { canAccess, useTool } = useToolAccess("TOUR_360"); // Custo: 1 CRÉDITO 

    const [title, setTitle] = useState("");
    const [rooms, setRooms] = useState<RoomForm[]>([
        { id: "1", label: "Sala de Estar", imageFile: null, imageUrl: "", uploadProgress: 0, status: "idle" }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addRoom = () => {
        setRooms([...rooms, {
            id: uuidv4(),
            label: "",
            imageFile: null,
            imageUrl: "",
            uploadProgress: 0,
            status: "idle"
        }]);
    };

    const removeRoom = (id: string) => {
        if (rooms.length === 1) return;
        setRooms(rooms.filter(r => r.id !== id));
    };

    const updateRoom = (id: string, updates: Partial<RoomForm>) => {
        setRooms(prevRooms => prevRooms.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const uploadImage = async (id: string, file: File): Promise<string> => {
        try {
            updateRoom(id, { status: "uploading", uploadProgress: 0, error: undefined });

            const secureUrl = await uploadToCloudinary(file, (progress) => {
                updateRoom(id, { uploadProgress: progress });
            });

            updateRoom(id, { imageUrl: secureUrl, status: "done", uploadProgress: 100 });
            return secureUrl;
        } catch (err: any) {
            console.error("Cloudinary upload error for room:", id, err);
            updateRoom(id, { status: "error", error: err.message || "Erro no upload para Cloudinary" });
            throw err;
        }
    };

    const handleFileChange = async (id: string, file: File) => {
        // Preview local imediato
        const localUrl = URL.createObjectURL(file);
        updateRoom(id, {
            imageFile: file,
            imageUrl: localUrl,
            status: "optimizing",
            uploadProgress: 0,
            error: undefined
        });

        try {
            // Otimização client-side
            const optimizedFile = await optimizeImage(file);

            // Substitui pelo arquivo otimizado e inicia upload
            updateRoom(id, { imageFile: optimizedFile });
            await uploadImage(id, optimizedFile);
        } catch (err: any) {
            console.error("Optimization or upload failed:", err);
            updateRoom(id, { status: "error", error: err.message || "Falha ao processar imagem." });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError("Você precisa estar logado para criar um tour.");
            return;
        }

        // Validação de Créditos
        const hasAccess = await canAccess();
        if (!hasAccess) {
            setError("Você não possui créditos suficientes para criar um tour profissional.");
            return;
        }

        // Verificar se todos os uploads terminaram
        const isStillUploading = rooms.some(r => r.status === "uploading");
        if (isStillUploading) {
            setError("Aguarde o upload das imagens terminar antes de salvar.");
            return;
        }

        // Verificar se há erros
        const hasErrors = rooms.some(r => r.status === "error" || (r.imageFile && !r.imageUrl.startsWith('https')));
        if (hasErrors) {
            setError("Algumas imagens falharam no upload. Tente selecioná-las novamente.");
            return;
        }

        // Verificar se todos têm imagem
        if (rooms.some(r => !r.imageUrl)) {
            setError("Todos os ambientes precisam de uma foto 360°.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Se algum ainda não foi upado (idle), upar agora
            const finalUploads = rooms.map(async (room) => {
                if (room.imageFile && room.status !== "done") {
                    const url = await uploadImage(room.id, room.imageFile);
                    return { ...room, imageUrl: url, status: "done" as const };
                }
                return room;
            });

            const updatedRooms = await Promise.all(finalUploads);

            // 1. Consumir Crédito
            const consumed = await useTool(`Criação de Tour 360: ${title || 'Sem título'}`);
            if (!consumed) {
                throw new Error("Falha ao debitar crédito. O tour não foi criado.");
            }

            // 2. Salvar no Realtime Database
            const toursListRef = dbRef(rtdb, "tours");
            const newTourRef = push(toursListRef);
            const tourId = newTourRef.key as string;

            const scenes: Record<string, any> = {};
            updatedRooms.forEach(room => {
                scenes[room.id] = {
                    id: room.id,
                    name: room.label,
                    panoramaUrl: room.imageUrl,
                    hotspots: []
                };
            });

            // Lógica de Auto-Link IA: Conectar em sequência se houver mais de um ambiente
            if (updatedRooms.length >= 2) {
                for (let i = 0; i < updatedRooms.length - 1; i++) {
                    const currentId = updatedRooms[i].id;
                    const nextId = updatedRooms[i + 1].id;

                    // Ida (Seta para frente)
                    scenes[currentId].hotspots.push({
                        id: uuidv4(),
                        pitch: -15,
                        yaw: 15,
                        targetSceneId: nextId,
                        text: `Ir para ${updatedRooms[i + 1].label}`
                    });

                    // Volta (Seta para trás)
                    scenes[nextId].hotspots.push({
                        id: uuidv4(),
                        pitch: -15,
                        yaw: -165,
                        targetSceneId: currentId,
                        text: `Voltar para ${updatedRooms[i].label}`
                    });
                }
            }

            const tourData = {
                id: tourId,
                userId: user.id,
                title,
                published: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                firstSceneId: updatedRooms[0]?.id || "",
                scenes: scenes
            };

            await set(newTourRef, tourData);
            router.push(`/tours/${tourId}/edit`);
        } catch (err: any) {
            setError(`Erro ao criar tour: ${err.message || "Erro desconhecido"}`);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-slate-900">Novo Tour 360°</h1>
                        <p className="text-slate-500 text-sm mt-1">Configure os ambientes do seu tour virtual</p>
                    </div>
                    <Badge variant="gold" className="py-2 px-4 text-sm h-fit">
                        <Coins className="h-4 w-4 mr-2" />
                        Custo: {TOOL_CREDIT_COSTS['tour_360']} créditos
                    </Badge>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card padding="lg" className="space-y-4">
                    <h2 className="font-bold text-lg text-slate-900">Informações Básicas</h2>
                    <Input
                        label="Título do Tour"
                        placeholder="Ex: Apartamento Decorado - Ed. Infinity"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </Card>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg text-slate-900">Ambientes</h2>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            leftIcon={<Plus className="h-4 w-4" />}
                            onClick={addRoom}
                        >
                            Adicionar Ambiente
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {rooms.map((room, index) => (
                            <Card key={room.id} padding="lg" className="relative group border-slate-200">
                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                    <Badge variant="outline">#{index + 1}</Badge>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-slate-400 hover:text-red-500 h-8 w-8"
                                        onClick={() => removeRoom(room.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <Input
                                            label="Nome do Ambiente"
                                            placeholder="Ex: Suíte Master"
                                            value={room.label}
                                            onChange={(e) => updateRoom(room.id, { label: e.target.value })}
                                            required
                                        />

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Foto 360° (Equirretangular)</label>
                                            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 transition-colors hover:border-brand-300 hover:bg-brand-50/50 flex flex-col items-center justify-center gap-3 cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => e.target.files?.[0] && handleFileChange(room.id, e.target.files[0])}
                                                />
                                                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                    {room.status === "uploading" ? (
                                                        <div className="h-6 w-6 border-2 border-brand-500 border-t-transparent animate-spin rounded-full" />
                                                    ) : (
                                                        <ImageIcon className="h-6 w-6" />
                                                    )}
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-semibold text-slate-700">
                                                        {room.imageFile ? room.imageFile.name : "Clique para selecionar"}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">JPG ou PNG imersivo (2:1)</p>
                                                </div>
                                            </div>

                                            {room.status === "error" && (
                                                <p className="text-[10px] text-red-600 font-bold flex items-center gap-1 mt-1">
                                                    <AlertCircle className="h-3 w-3" /> {room.error || "Erro no upload"}
                                                </p>
                                            )}

                                            {room.status === "optimizing" && (
                                                <div className="flex flex-col items-center justify-center py-4 gap-2 animate-pulse">
                                                    <Loader2 className="h-5 w-5 text-brand-500 animate-spin" />
                                                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-tighter">Otimizando Imagem...</span>
                                                </div>
                                            )}

                                            {room.status === "uploading" && (
                                                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                                    <div
                                                        className="bg-brand-600 h-full transition-all duration-300"
                                                        style={{ width: `${room.uploadProgress}%` }}
                                                    />
                                                </div>
                                            )}

                                            {room.status === "done" && (
                                                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Upload concluído
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Pré-visualização</label>
                                        <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-800">
                                            {room.imageUrl ? (
                                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${room.imageUrl})` }} />
                                            ) : (
                                                <div className="text-center space-y-2">
                                                    <Camera className="h-8 w-8 text-slate-700 mx-auto" />
                                                    <p className="text-xs text-slate-600">Aguardando imagem...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        loading={loading}
                        className="px-8"
                    >
                        Criar Tour 360°
                    </Button>
                </div>
            </form>
        </div>
    );
}
