"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Camera, Plus, Eye, Coins, Loader2, Trash2 } from "lucide-react";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, remove } from "firebase/database";
import { useAuth } from "@/hooks/auth-provider";

interface TourRoom {
    id: string;
    label: string;
    imageUrl: string;
}

interface Tour {
    id: string;
    title: string;
    published: boolean;
    scenes: Record<string, any>;
    createdAt: string;
}

export default function ToursPage() {
    const { user } = useAuth();
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const toursRef = ref(rtdb, "tours");
        const unsubscribe = onValue(toursRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const tourList = Object.entries(data)
                    .map(([id, value]: [string, any]) => ({
                        id,
                        ...value
                    }))
                    .filter((t: any) => t.userId === user.id)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                setTours(tourList);
            } else {
                setTours([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleDelete = async (tourId: string) => {
        if (!confirm("Tem certeza que deseja excluir este tour? Esta ação não pode ser desfeita.")) {
            return;
        }

        try {
            const tourRef = ref(rtdb, `tours/${tourId}`);
            await remove(tourRef);
            // O onValue irá atualizar o estado automaticamente
        } catch (error) {
            console.error("Error deleting tour:", error);
            alert("Erro ao excluir o tour. Tente novamente.");
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
                <p className="text-slate-500 text-sm">Carregando seus tours...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">Tours 360°</h1>
                    <p className="text-slate-500 text-sm mt-1">Crie tours virtuais imersivos para seus imóveis</p>
                </div>
                <Link href="/tours/new">
                    <Button leftIcon={<Plus className="h-4 w-4" />}>Novo Tour</Button>
                </Link>
            </div>

            {/* Credit info */}
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                <Coins className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-amber-800 text-sm">Tour Profissional</p>
                    <p className="text-amber-600 text-xs mt-0.5">Cada tour criado consome 1 crédito. <Link href="/plans" className="underline">Adquira mais créditos</Link></p>
                </div>
            </div>

            {/* Tours grid */}
            {tours.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {tours.map((tour) => {
                        const scenesArray = Object.values(tour.scenes || {});
                        return (
                            <Card key={tour.id} hover padding="md" className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center">
                                        <Camera className="h-5 w-5 text-brand-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm leading-tight truncate">{tour.title}</p>
                                        <p className="text-xs text-slate-400">{scenesArray.length} ambiente{scenesArray.length !== 1 ? "s" : ""}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {scenesArray.slice(0, 3).map((scene: any) => (
                                        <Badge key={scene.id} variant="default" className="text-[10px]">{scene.name}</Badge>
                                    ))}
                                    {scenesArray.length > 3 && (
                                        <Badge variant="default" className="text-[10px]">+{scenesArray.length - 3}</Badge>
                                    )}
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <Badge variant={tour.published ? "success" : "warning"} dot>
                                        {tour.published ? "Publicado" : "Em Edição"}
                                    </Badge>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDelete(tour.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                            title="Excluir Tour"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <Link href={`/tours/${tour.id}/edit`}>
                                            <Button size="sm" variant="ghost" className="text-xs h-8">
                                                Editar
                                            </Button>
                                        </Link>
                                        <Link href={`/tour/${tour.id}`}>
                                            <Button size="sm" variant="outline" className="text-xs h-8" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                                                Ver
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}

                    {/* Add new */}
                    <div className="min-h-[160px] flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all cursor-pointer group" onClick={() => window.location.href = '/tours/new'}>
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                            <Plus className="h-6 w-6 text-slate-400 group-hover:text-brand-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-500 group-hover:text-brand-600">Criar novo tour</p>
                    </div>

                </div>
            ) : (
                <Card padding="lg" className="text-center">
                    <Camera className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-display font-bold text-slate-700 mb-2">Nenhum tour criado ainda</h3>
                    <p className="text-slate-500 text-sm mb-4">Crie seu primeiro tour 360° e impressione seus clientes.</p>
                    <Link href="/tours/new">
                        <Button>Criar primeiro tour</Button>
                    </Link>
                </Card>
            )}
        </div>
    );
}
