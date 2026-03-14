"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/auth-provider";
import { useLanguage } from "@/hooks/use-language";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, remove } from "firebase/database";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
    ArrowLeft, History, FileText, Calendar, 
    Trash2, ExternalLink, Search, Loader2 
} from "lucide-react";

interface SavedDoc {
    id: string;
    templateId: string;
    templateName: string;
    docText: string;
    createdAt: string;
    brokerName?: string;
}

export default function DocsHistoryPage() {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const [docs, setDocs] = useState<SavedDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!user?.id) return;

        const docsRef = ref(rtdb, `documents/${user.id}`);
        const unsubscribe = onValue(docsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.values(data) as SavedDoc[];
                setDocs(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } else {
                setDocs([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.id]);

    const handleDelete = async (id: string) => {
        if (!user?.id || !confirm("Tem certeza que deseja excluir este documento do histórico?")) return;
        try {
            await remove(ref(rtdb, `documents/${user.id}/${id}`));
            toast.success("Documento removido.");
        } catch (err) {
            toast.error("Erro ao remover documento.");
        }
    };

    const filteredDocs = docs.filter(doc => 
        doc.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.docText.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/tools/docs">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                            <History className="h-5 w-5 text-brand-500" /> Histórico de Documentos
                        </h1>
                        <p className="text-xs text-slate-500">Documentos salvos e gerados anteriormente</p>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Buscar no histórico..."
                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-full md:w-64"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
                    <p className="text-sm text-slate-500">Carregando seu histórico...</p>
                </div>
            ) : filteredDocs.length === 0 ? (
                <Card padding="lg" className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                        <FileText className="h-8 w-8 text-slate-300" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Nenhum documento encontrado</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
                            Você ainda não salvou nenhum documento ou nenhum coincide com sua busca.
                        </p>
                    </div>
                    <Link href="/tools/docs">
                        <Button variant="outline">Criar meu primeiro documento</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocs.map((doc) => (
                        <Card key={doc.id} className="group hover:shadow-lg transition-all border-slate-100 hover:border-brand-200">
                            <div className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-brand-50 rounded-lg">
                                        <FileText className="h-5 w-5 text-brand-600" />
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-1">
                                        {doc.templateName}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(doc.createdAt).toLocaleDateString()} {new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                <p className="text-xs text-slate-500 line-clamp-3 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                                    "{doc.docText.slice(0, 150)}..."
                                </p>

                                <div className="flex gap-2 pt-2">
                                    <Link href={`/tools/docs/${doc.templateId}?id=${doc.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full text-[10px] h-8" leftIcon={<ExternalLink className="h-3 w-3" />}>
                                            Visualizar
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
