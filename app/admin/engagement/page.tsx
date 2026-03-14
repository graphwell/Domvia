"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { 
    Sparkles, Plus, Trash2, Save, 
    MessageCircle, Lightbulb, Target, Wrench 
} from "lucide-react";
import { toast } from "sonner";
import { EngagementCategory, EngagementMessage } from "@/lib/engagement";

const CATEGORY_ICONS = {
    motivation: MessageCircle,
    tip: Lightbulb,
    opportunity: Target,
    feature_suggestion: Wrench
};

const CATEGORY_LABELS = {
    motivation: "Motivação",
    tip: "Dica",
    opportunity: "Oportunidade",
    feature_suggestion: "Sugestão de Ferramenta"
};

export default function EngagementAdminPage() {
    const [messages, setMessages] = useState<EngagementMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMsg, setNewMsg] = useState({
        category: "motivation" as EngagementCategory,
        content: "",
        targetTool: ""
    });

    useEffect(() => {
        const msgRef = ref(rtdb, "engagement_messages");
        const unsubscribe = onValue(msgRef, (snap) => {
            if (snap.exists()) {
                const data = snap.val();
                const list: EngagementMessage[] = Object.keys(data).map(k => ({
                    ...data[k],
                    id: k
                }));
                setMessages(list);
            } else {
                setMessages([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleAdd = async () => {
        if (!newMsg.content.trim()) return;
        try {
            const msgRef = ref(rtdb, "engagement_messages");
            await push(msgRef, newMsg);
            setNewMsg({ category: "motivation", content: "", targetTool: "" });
            toast.success("Mensagem adicionada com sucesso!");
        } catch (e) {
            toast.error("Erro ao adicionar mensagem.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta mensagem?")) return;
        try {
            await remove(ref(rtdb, `engagement_messages/${id}`));
            toast.success("Mensagem excluída.");
        } catch (e) {
            toast.error("Erro ao excluir.");
        }
    };

    const handleUpdate = async (id: string, data: any) => {
        try {
            await set(ref(rtdb, `engagement_messages/${id}`), data);
            toast.success("Atualizado!");
        } catch (e) {
            toast.error("Erro ao atualizar.");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-indigo-600" />
                    Inteligência Domvia
                </h1>
                <p className="text-slate-500 text-sm">Gerencie as mensagens automáticas e sugestões enviadas aos usuários.</p>
            </div>

            {/* Nova Mensagem */}
            <Card padding="md" className="border-indigo-100 bg-indigo-50/30">
                <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Criar Nova Mensagem
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
                        <select 
                            className="w-full rounded-xl border-slate-200 text-sm"
                            value={newMsg.category}
                            onChange={e => setNewMsg({...newMsg, category: e.target.value as any})}
                        >
                            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Conteúdo da Mensagem</label>
                        <Input 
                            placeholder="Ex: Olá! Sabia que você pode..." 
                            value={newMsg.content}
                            onChange={e => setNewMsg({...newMsg, content: e.target.value})}
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ferramenta Alvo (opcional)</label>
                        <Input 
                            placeholder="Ex: ai_chat_message" 
                            value={newMsg.targetTool}
                            onChange={e => setNewMsg({...newMsg, targetTool: e.target.value})}
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={handleAdd} leftIcon={<Plus className="h-4 w-4" />}>
                        Adicionar à Biblioteca
                    </Button>
                </div>
            </Card>

            {/* Lista de Mensagens */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-10 text-center text-slate-400">Carregando biblioteca...</div>
                ) : messages.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 border-2 border-dashed rounded-3xl">
                        Nenhuma mensagem customizada. O sistema usará os padrões do código.
                    </div>
                ) : (
                    messages.map(msg => {
                        const Icon = CATEGORY_ICONS[msg.category] || MessageCircle;
                        return (
                            <Card key={msg.id} padding="md" className="group">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                        <Icon className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                                                {CATEGORY_LABELS[msg.category]}
                                            </span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                    onClick={() => handleDelete(msg.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <textarea 
                                            className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 resize-none h-auto"
                                            value={msg.content}
                                            rows={2}
                                            onChange={e => {
                                                const list = [...messages];
                                                const idx = list.findIndex(m => m.id === msg.id);
                                                list[idx].content = e.target.value;
                                                setMessages(list);
                                            }}
                                            onBlur={e => handleUpdate(msg.id, { ...msg, content: e.target.value })}
                                        />
                                        {msg.targetTool && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-indigo-500 font-bold">
                                                <Wrench className="h-3 w-3" />
                                                Target: {msg.targetTool}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
