"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { ArrowLeft, Save, ImagePlus } from "lucide-react";
import Link from "next/link";

const PROPERTY_TYPES = [
    { value: "apartment", label: "Apartamento" },
    { value: "house", label: "Casa" },
    { value: "land", label: "Terreno" },
    { value: "commercial", label: "Comercial" },
    { value: "rural", label: "Rural" },
];

export default function NewPropertyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: "", address: "", city: "", state: "",
        type: "apartment", price: "", area: "",
        bedrooms: "", bathrooms: "", parkingSpots: "",
        description: "", whatsapp: "",
    });

    const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/properties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    price: Number(form.price),
                    area: form.area ? Number(form.area) : undefined,
                    bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
                    bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
                    parkingSpots: form.parkingSpots ? Number(form.parkingSpots) : undefined,
                    slug: form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                    userId: "user_01",
                }),
            });
            if (res.ok) {
                router.push("/properties");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/properties">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold text-slate-900">Novo Imóvel</h1>
                    <p className="text-slate-500 text-sm">Preencha as informações para criar a página do imóvel</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic info */}
                <Card padding="md" className="space-y-4">
                    <h2 className="font-display font-bold text-slate-800">Informações Básicas</h2>

                    <Input label="Título do Imóvel" required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex: Apartamento 3 quartos no Leblon" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Endereço" required value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Rua das Flores, 123" />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de Imóvel <span className="text-red-500">*</span></label>
                            <select required value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none">
                                {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Cidade" required value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="São Paulo" />
                        <Input label="Estado" required value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="SP" />
                    </div>
                </Card>

                {/* Pricing & details */}
                <Card padding="md" className="space-y-4">
                    <h2 className="font-display font-bold text-slate-800">Preço e Características</h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Input label="Preço (R$)" required type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="850000" className="col-span-2 sm:col-span-1" />
                        <Input label="Área (m²)" type="number" value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="120" />
                        <Input label="Quartos" type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} placeholder="3" />
                        <Input label="Banheiros" type="number" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} placeholder="2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Vagas de Garagem" type="number" value={form.parkingSpots} onChange={(e) => set("parkingSpots", e.target.value)} placeholder="1" />
                        <Input label="WhatsApp (sem máscara)" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="11999999999" hint="Para o botão de contato" />
                    </div>
                </Card>

                {/* Description */}
                <Card padding="md" className="space-y-4">
                    <h2 className="font-display font-bold text-slate-800">Descrição</h2>
                    <Textarea
                        label="Descrição do imóvel"
                        required
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="Descreva o imóvel com seus diferenciais..."
                        className="min-h-[140px]"
                        hint="Dica: use a ferramenta de IA para gerar uma descrição profissional"
                    />
                </Card>

                {/* Photos */}
                <Card padding="md" className="space-y-4">
                    <h2 className="font-display font-bold text-slate-800">Fotos</h2>
                    <div className="flex items-center justify-center h-32 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all cursor-pointer group">
                        <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-brand-600">
                            <ImagePlus className="h-8 w-8" />
                            <p className="text-sm font-medium">Clique para adicionar fotos</p>
                            <p className="text-xs">Máx. 20 fotos, 10MB cada</p>
                        </div>
                    </div>
                </Card>

                <div className="flex gap-3 justify-end">
                    <Link href="/properties">
                        <Button variant="outline" type="button">Cancelar</Button>
                    </Link>
                    <Button type="submit" loading={loading} leftIcon={<Save className="h-4 w-4" />}>
                        Publicar Imóvel
                    </Button>
                </div>
            </form>
        </div>
    );
}
