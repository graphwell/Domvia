import { Metadata } from "next";
import { CaptacaoClient } from "@/components/tools/CaptacaoClient";

export const metadata: Metadata = {
    title: "Captação Inteligente | Domvia",
    description: "Capture placas de imóveis e identifique telefones automaticamente com IA.",
};

export default function CaptacaoPage() {
    return (
        <div className="container mx-auto px-4 py-6">
            <CaptacaoClient />
        </div>
    );
}
