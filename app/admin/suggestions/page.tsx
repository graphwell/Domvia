"use client";

import { useState, useEffect } from "react";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, update } from "firebase/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
    MessageSquare, Clock, CheckCircle2,
    ChevronRight, AlertCircle, Phone,
    Mail, MapPin, Trash2, Filter,
    Reply
} from "lucide-react";
import { Suggestion } from "@/lib/suggestions";

export default function AdminSuggestionsPage() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Suggestion["status"] | "all">("all");

    useEffect(() => {
        const suggRef = ref(rtdb, "suggestions");
        const unsubscribe = onValue(suggRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list = Object.keys(data).map(key => ({
                    ...data[key],
                    id: key
                })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                setSuggestions(list);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const updateStatus = async (id: string, status: Suggestion["status"]) => {
        try {
            const itemRef = ref(rtdb, `suggestions/${id}`);
            await update(itemRef, { status });
        } catch (e) {
            console.error(e);
        }
    };

    const filtered = filter === "all" ? suggestions : suggestions.filter(s => s.status === filter);

    const STATUS_MAP = {
        pending: { label: "Pendente", color: "bg-amber-100 text-amber-700", icon: Clock },
        reviewing: { label: "Em Análise", color: "bg-blue-100 text-blue-700", icon: Reply },
        implemented: { label: "Implementado", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
        dismissed: { label: "Descartado", color: "bg-slate-100 text-slate-500", icon: Trash2 },
    };

    const PRIORITY_COLORS = {
        low: "bg-slate-100 text-slate-600",
        medium: "bg-orange-100 text-orange-600",
        high: "bg-red-100 text-red-600",
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 font-display">Sugestões e Feedbacks</h1>
                    <p className="text-slate-500 text-sm">Feedback dos usuários e solicitações de melhoria</p>
                </div>
                <div className="flex gap-2">
                    {["all", "pending", "reviewing", "implemented"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${filter === s
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                }`}
                        >
                            {s === "all" ? "Todos" : STATUS_MAP[s as keyof typeof STATUS_MAP]?.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Carregando sugestões...</p>
                </div>
            ) : filtered.length === 0 ? (
                <Card className="py-20 text-center border-dashed border-2">
                    <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Nenhuma sugestão encontrada neste filtro.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filtered.map((s) => {
                        const StIcon = STATUS_MAP[s.status]?.icon || Clock;
                        return (
                            <Card key={s.id} className="p-6 overflow-hidden relative">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Left Status Area */}
                                    <div className="md:w-48 shrink-0 space-y-3">
                                        <div className={`px-3 py-2 rounded-xl flex items-center gap-2 ${STATUS_MAP[s.status]?.color}`}>
                                            <StIcon className="h-4 w-4" />
                                            <span className="text-xs font-bold">{STATUS_MAP[s.status]?.label}</span>
                                        </div>
                                        <div className="space-y-1.5 px-1">
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Prioridade</p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${PRIORITY_COLORS[s.priority]}`}>
                                                {s.priority}
                                            </span>
                                        </div>
                                        {s.allowReply && (
                                            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl text-[10px] font-bold flex items-center gap-2 border border-emerald-100">
                                                <Badge className="bg-emerald-500 h-2 w-2 rounded-full p-0 shrink-0 animate-pulse" />
                                                Pode Replicar
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                                            <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{s.description}</p>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-slate-500 py-3 border-y border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3.5 w-3.5" />
                                                <span className="truncate">{s.userEmail}</span>
                                            </div>
                                            {s.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    <span>{s.phone}</span>
                                                </div>
                                            )}
                                            {s.city && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    <span>{s.city}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Admin Actions */}
                                        <div className="flex gap-2 pt-2">
                                            {s.status === "pending" && (
                                                <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => updateStatus(s.id!, "reviewing")}>
                                                    Analisar
                                                </Button>
                                            )}
                                            {s.status !== "implemented" && (
                                                <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => updateStatus(s.id!, "implemented")}>
                                                    Marcar como Feito
                                                </Button>
                                            )}
                                            {s.status !== "dismissed" && (
                                                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-red-500" onClick={() => updateStatus(s.id!, "dismissed")}>
                                                    Ignorar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
