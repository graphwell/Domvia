"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tour } from "@/types";
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import TourEditor from "@/components/tours/TourEditor";
import { Loader2, AlertTriangle, ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function EditTourPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [tour, setTour] = useState<Tour | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const tourRef = ref(rtdb, `tours/${id}`);
        const unsubscribe = onValue(tourRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setTour(data);
            } else {
                setError("Tour não encontrado.");
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching tour:", err);
            setError("Erro ao carregar o tour.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
                <p className="text-slate-500 font-medium">Carregando ambiente de edição...</p>
            </div>
        );
    }

    if (error || !tour) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-6">
                <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
                    <AlertTriangle className="h-8 w-8" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">{error || "Algo deu errado"}</h1>
                <p className="text-slate-500 max-w-sm">Não foi possível carregar as informações deste tour. Verifique se o link está correto.</p>
                <Link href="/tours">
                    <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                        Voltar para Tours
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/tours">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-display text-2xl font-bold text-slate-900">{tour.title}</h1>
                        <p className="text-slate-500 text-sm">Editor de Navegação e Ambientes</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/tour/${id}`} target="_blank">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" /> Preview Público
                        </Button>
                    </Link>
                </div>
            </div>

            <TourEditor
                tour={tour}
                onSave={() => router.push("/tours")}
            />
        </div>
    );
}
