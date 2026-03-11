"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
    ArrowLeft, Printer, Share2, FileText,
    CheckCircle2, ChevronDown, ChevronUp, Eye,
    Upload, X, ImageIcon, Building2
} from "lucide-react";
import { useAuth } from "@/hooks/auth-provider";

// ── Types ────────────────────────────────────────────────
interface ReceiptForm {
    tipo: "entrega" | "devolucao" | "venda";
    data: string;
    local: string;

    // Cedente (entrega as chaves)
    cedente_nome: string;
    cedente_cpf: string;
    cedente_tel: string;
    cedente_tipo: "locador" | "vendedor" | "imobiliaria";

    // Cessionário (recebe as chaves)
    cessionario_nome: string;
    cessionario_cpf: string;
    cessionario_tel: string;
    cessionario_tipo: "locatario" | "comprador" | "proprietario";

    // Imóvel
    imovel_endereco: string;
    imovel_complemento: string;
    imovel_cidade: string;
    imovel_matricula: string;

    // Chaves
    chaves_qtd: string;
    chaves_descricao: string;
    controle_acesso: string;

    // Medidores
    agua_matricula: string;
    agua_leitura: string;
    luz_instalacao: string;
    luz_leitura: string;
    gas_medidor: string;
    gas_leitura: string;

    // Estado
    estado_geral: "otimo" | "bom" | "regular" | "necessita_reparos";
    observacoes: string;

    // Testemunhas
    testemunha1_nome: string;
    testemunha1_cpf: string;
    testemunha2_nome: string;
    testemunha2_cpf: string;

    // Corretor
    corretor_nome: string;
    corretor_creci: string;
}

const defaultForm: ReceiptForm = {
    tipo: "entrega",
    data: new Date().toISOString().slice(0, 10),
    local: "",
    cedente_nome: "", cedente_cpf: "", cedente_tel: "", cedente_tipo: "locador",
    cessionario_nome: "", cessionario_cpf: "", cessionario_tel: "", cessionario_tipo: "locatario",
    imovel_endereco: "", imovel_complemento: "", imovel_cidade: "", imovel_matricula: "",
    chaves_qtd: "1", chaves_descricao: "Chave da porta principal",
    controle_acesso: "",
    agua_matricula: "", agua_leitura: "",
    luz_instalacao: "", luz_leitura: "",
    gas_medidor: "", gas_leitura: "",
    estado_geral: "bom",
    observacoes: "",
    testemunha1_nome: "", testemunha1_cpf: "",
    testemunha2_nome: "", testemunha2_cpf: "",
    corretor_nome: "", corretor_creci: "",
};

const TIPOS = {
    entrega: "Entrega de Chaves",
    devolucao: "Devolução de Chaves",
    venda: "Transmissão de Chaves (Compra e Venda)",
};

const ESTADOS = {
    otimo: "Ótimo",
    bom: "Bom",
    regular: "Regular",
    necessita_reparos: "Necessita Reparos",
};

const formatDate = (iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
};

// ── Document Preview ─────────────────────────────────────
interface DocumentPreviewProps {
    form: ReceiptForm;
    logoBase64?: string;
    brandName?: string;
}

function DocumentPreview({ form, logoBase64, brandName }: DocumentPreviewProps) {
    const today = formatDate(form.data);
    const tipoLabel = TIPOS[form.tipo];
    const cedenteTipo = { locador: "Locador", vendedor: "Vendedor", imobiliaria: "Imobiliária" }[form.cedente_tipo];
    const cessionarioTipo = { locatario: "Locatário", comprador: "Comprador", proprietario: "Proprietário" }[form.cessionario_tipo];

    return (
        <div
            id="receipt-document"
            className="bg-white text-slate-900 font-serif text-sm leading-relaxed"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
            {/* Header — com logo ou marca */}
            <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4 mb-6">
                {/* Lado esquerdo: logo ou nome da marca */}
                <div className="flex items-center" style={{ minWidth: "140px" }}>
                    {logoBase64 ? (
                        <img
                            src={logoBase64}
                            alt="Logo"
                            style={{ maxHeight: "64px", maxWidth: "140px", objectFit: "contain" }}
                        />
                    ) : brandName ? (
                        <div style={{ fontFamily: "Georgia, serif" }}>
                            <p className="text-xl font-bold text-slate-900 leading-tight">{brandName}</p>
                            {form.corretor_creci && (
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">CRECI {form.corretor_creci}</p>
                            )}
                        </div>
                    ) : (
                        <div style={{ width: "120px" }} />
                    )}
                </div>

                {/* Centro: título do documento */}
                <div className="text-center flex-1 px-4">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Documento Imobiliário</p>
                    <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">
                        Recibo de {tipoLabel}
                    </h1>
                    <p className="text-[10px] text-slate-500 mt-1">
                        Emitido em {today || "___/___/______"} — {form.local || "___________________"}
                    </p>
                </div>

                {/* Lado direito: espaço reservado (simetria) */}
                <div style={{ minWidth: "140px" }} />
            </div>

            {/* Partes */}
            <section className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-3">
                    1. Partes Envolvidas
                </h2>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="font-bold text-slate-700">{cedenteTipo} (Entrega as Chaves)</p>
                        <p><span className="font-medium">Nome:</span> {form.cedente_nome || "___________________________"}</p>
                        <p><span className="font-medium">CPF/CNPJ:</span> {form.cedente_cpf || "___________________________"}</p>
                        <p><span className="font-medium">Telefone:</span> {form.cedente_tel || "___________________________"}</p>
                    </div>
                    <div>
                        <p className="font-bold text-slate-700">{cessionarioTipo} (Recebe as Chaves)</p>
                        <p><span className="font-medium">Nome:</span> {form.cessionario_nome || "___________________________"}</p>
                        <p><span className="font-medium">CPF/CNPJ:</span> {form.cessionario_cpf || "___________________________"}</p>
                        <p><span className="font-medium">Telefone:</span> {form.cessionario_tel || "___________________________"}</p>
                    </div>
                </div>
            </section>

            {/* Imóvel */}
            <section className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-3">
                    2. Identificação do Imóvel
                </h2>
                <p><span className="font-medium">Endereço:</span> {form.imovel_endereco || "___________________________"} {form.imovel_complemento && `— ${form.imovel_complemento}`}</p>
                <p><span className="font-medium">Cidade:</span> {form.imovel_cidade || "___________________________"}</p>
                {form.imovel_matricula && <p><span className="font-medium">Matrícula / Registro:</span> {form.imovel_matricula}</p>}
            </section>

            {/* Chaves */}
            <section className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-3">
                    3. Chaves e Acessos Entregues
                </h2>
                <p><span className="font-medium">Quantidade de chaves:</span> {form.chaves_qtd || "___"}</p>
                <p><span className="font-medium">Descrição:</span> {form.chaves_descricao || "___________________________"}</p>
                {form.controle_acesso && <p><span className="font-medium">Controle de acesso / Interfone:</span> {form.controle_acesso}</p>}
            </section>

            {/* Medidores */}
            <section className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-3">
                    4. Leituras de Medidores
                </h2>
                <table className="w-full text-sm border border-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left px-3 py-1.5 font-semibold text-slate-700">Serviço</th>
                            <th className="text-left px-3 py-1.5 font-semibold text-slate-700">Matrícula / Instalação</th>
                            <th className="text-left px-3 py-1.5 font-semibold text-slate-700">Leitura Atual</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t border-slate-200">
                            <td className="px-3 py-1.5">Água</td>
                            <td className="px-3 py-1.5">{form.agua_matricula || "—"}</td>
                            <td className="px-3 py-1.5">{form.agua_leitura || "—"}</td>
                        </tr>
                        <tr className="border-t border-slate-200">
                            <td className="px-3 py-1.5">Energia Elétrica</td>
                            <td className="px-3 py-1.5">{form.luz_instalacao || "—"}</td>
                            <td className="px-3 py-1.5">{form.luz_leitura || "—"}</td>
                        </tr>
                        <tr className="border-t border-slate-200">
                            <td className="px-3 py-1.5">Gás</td>
                            <td className="px-3 py-1.5">{form.gas_medidor || "—"}</td>
                            <td className="px-3 py-1.5">{form.gas_leitura || "—"}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* Estado Geral */}
            <section className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-3">
                    5. Estado Geral do Imóvel
                </h2>
                <p><span className="font-medium">Condição na entrega:</span> <strong>{ESTADOS[form.estado_geral]}</strong></p>
                {form.observacoes && (
                    <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded text-sm">
                        <p className="font-medium text-slate-700 mb-1">Observações:</p>
                        <p className="whitespace-pre-wrap">{form.observacoes}</p>
                    </div>
                )}
            </section>

            {/* Declaração */}
            <section className="mb-8">
                <div className="p-4 border border-slate-300 rounded bg-slate-50 text-sm leading-relaxed">
                    <p>
                        As partes acima identificadas declaram que nesta data procedeu-se à <strong>{tipoLabel.toLowerCase()}</strong> referente ao imóvel acima descrito, nada mais havendo a reclamar entre si pelo presente ato.
                    </p>
                    {form.corretor_nome && (
                        <p className="mt-2">
                            Intermediação: <strong>{form.corretor_nome}</strong>
                            {form.corretor_creci && ` — CRECI ${form.corretor_creci}`}
                        </p>
                    )}
                </div>
            </section>

            {/* Assinaturas */}
            <section className="mb-8">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-6">
                    6. Assinaturas
                </h2>
                <div className="grid grid-cols-2 gap-12">
                    <div className="text-center">
                        <div className="border-b border-slate-800 mb-2 h-12" />
                        <p className="font-medium">{form.cedente_nome || "Cedente"}</p>
                        <p className="text-xs text-slate-500">{cedenteTipo} — CPF: {form.cedente_cpf || "___________"}</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-slate-800 mb-2 h-12" />
                        <p className="font-medium">{form.cessionario_nome || "Cessionário"}</p>
                        <p className="text-xs text-slate-500">{cessionarioTipo} — CPF: {form.cessionario_cpf || "___________"}</p>
                    </div>
                </div>

                {/* Testemunhas */}
                <div className="grid grid-cols-2 gap-12 mt-8">
                    <div className="text-center">
                        <div className="border-b border-slate-800 mb-2 h-12" />
                        <p className="text-sm text-slate-600">{form.testemunha1_nome || "Testemunha 1"}</p>
                        <p className="text-xs text-slate-400">CPF: {form.testemunha1_cpf || "___________"}</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-slate-800 mb-2 h-12" />
                        <p className="text-sm text-slate-600">{form.testemunha2_nome || "Testemunha 2"}</p>
                        <p className="text-xs text-slate-400">CPF: {form.testemunha2_cpf || "___________"}</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <div className="text-center text-xs text-slate-400 border-t border-slate-200 pt-4 mt-4">
                <p>Documento gerado por <strong>Domvia</strong> — {today}</p>
                <p>Este documento possui validade legal quando assinado pelas partes. Validade: 2 (duas) vias.</p>
            </div>
        </div>
    );
}

// ── Section Component ────────────────────────────────────
function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <Card padding="md" className="space-y-4">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between text-left"
            >
                <h2 className="font-display font-bold text-slate-800">{title}</h2>
                {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
            {open && <div className="space-y-4">{children}</div>}
        </Card>
    );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children}
        </div>
    );
}

const inputCls = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none bg-white";
const selectCls = inputCls;

// ── Main Page ────────────────────────────────────────────
export default function ReceiptPage() {
    const { user } = useAuth();
    const [form, setForm] = useState<ReceiptForm>({
        ...defaultForm,
        corretor_nome: user?.name ?? "",
    });
    const [preview, setPreview] = useState(false);

    // Branding
    const [logoBase64, setLogoBase64] = useState<string | undefined>();
    const [brandName, setBrandName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (ev) => setLogoBase64(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const set = (k: keyof ReceiptForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const handlePrint = () => { window.print(); };

    const handleShare = () => {
        const text = `*Recibo de ${TIPOS[form.tipo]}*\n\nImóvel: ${form.imovel_endereco}\nCedente: ${form.cedente_nome}\nCessionário: ${form.cessionario_nome}\nData: ${formatDate(form.data)}\n\n_Gerado no Domvia_`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    };

    return (
        <>
            {/* Print-only styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #receipt-document, #receipt-document * { visibility: visible; }
                    #receipt-document {
                        position: fixed;
                        top: 0; left: 0;
                        width: 100%;
                        padding: 32px;
                    }
                }
            `}</style>

            <div className="max-w-5xl mx-auto space-y-6 pb-20">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/tools">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="font-display text-2xl font-bold text-slate-900">Recibo de Entrega/Recebimento de Chaves</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Preencha os campos e gere um documento profissional</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            leftIcon={<Eye className="h-4 w-4" />}
                            onClick={() => setPreview(!preview)}
                        >
                            {preview ? "Editar" : "Visualizar"}
                        </Button>
                        <Button
                            variant="secondary"
                            leftIcon={<Share2 className="h-4 w-4" />}
                            onClick={handleShare}
                        >
                            WhatsApp
                        </Button>
                        <Button
                            leftIcon={<Printer className="h-4 w-4" />}
                            onClick={handlePrint}
                        >
                            Imprimir / PDF
                        </Button>
                    </div>
                </div>

                <div className={`grid gap-6 ${preview ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2"}`}>
                    {/* ── FORM ── */}
                    {!preview && (
                        <div className="space-y-4">
                            {/* Tipo e Data */}
                            <Section title="Informações do Recibo">
                                <div className="grid grid-cols-3 gap-4">
                                    <Field label="Tipo de Ato" required>
                                        <select className={selectCls} value={form.tipo} onChange={e => set("tipo", e.target.value as any)}>
                                            <option value="entrega">Entrega de Chaves</option>
                                            <option value="devolucao">Devolução de Chaves</option>
                                            <option value="venda">Compra e Venda</option>
                                        </select>
                                    </Field>
                                    <Field label="Data" required>
                                        <input type="date" className={inputCls} value={form.data} onChange={e => set("data", e.target.value)} />
                                    </Field>
                                    <Field label="Local (Cidade)">
                                        <input type="text" className={inputCls} placeholder="São Paulo - SP" value={form.local} onChange={e => set("local", e.target.value)} />
                                    </Field>
                                </div>
                            </Section>

                            {/* Cedente */}
                            <Section title="Cedente (Entrega as Chaves)">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Papel" required>
                                        <select className={selectCls} value={form.cedente_tipo} onChange={e => set("cedente_tipo", e.target.value as any)}>
                                            <option value="locador">Locador</option>
                                            <option value="vendedor">Vendedor</option>
                                            <option value="imobiliaria">Imobiliária</option>
                                        </select>
                                    </Field>
                                    <Field label="Telefone">
                                        <input type="tel" className={inputCls} placeholder="(11) 99999-9999" value={form.cedente_tel} onChange={e => set("cedente_tel", e.target.value)} />
                                    </Field>
                                </div>
                                <Field label="Nome Completo" required>
                                    <input type="text" className={inputCls} placeholder="Nome completo ou razão social" value={form.cedente_nome} onChange={e => set("cedente_nome", e.target.value)} />
                                </Field>
                                <Field label="CPF / CNPJ" required>
                                    <input type="text" className={inputCls} placeholder="000.000.000-00" value={form.cedente_cpf} onChange={e => set("cedente_cpf", e.target.value)} />
                                </Field>
                            </Section>

                            {/* Cessionário */}
                            <Section title="Cessionário (Recebe as Chaves)">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Papel" required>
                                        <select className={selectCls} value={form.cessionario_tipo} onChange={e => set("cessionario_tipo", e.target.value as any)}>
                                            <option value="locatario">Locatário</option>
                                            <option value="comprador">Comprador</option>
                                            <option value="proprietario">Proprietário</option>
                                        </select>
                                    </Field>
                                    <Field label="Telefone">
                                        <input type="tel" className={inputCls} placeholder="(11) 99999-9999" value={form.cessionario_tel} onChange={e => set("cessionario_tel", e.target.value)} />
                                    </Field>
                                </div>
                                <Field label="Nome Completo" required>
                                    <input type="text" className={inputCls} placeholder="Nome completo" value={form.cessionario_nome} onChange={e => set("cessionario_nome", e.target.value)} />
                                </Field>
                                <Field label="CPF / CNPJ" required>
                                    <input type="text" className={inputCls} placeholder="000.000.000-00" value={form.cessionario_cpf} onChange={e => set("cessionario_cpf", e.target.value)} />
                                </Field>
                            </Section>

                            {/* Imóvel */}
                            <Section title="Dados do Imóvel">
                                <Field label="Endereço Completo" required>
                                    <input type="text" className={inputCls} placeholder="Rua, número, bairro" value={form.imovel_endereco} onChange={e => set("imovel_endereco", e.target.value)} />
                                </Field>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Complemento">
                                        <input type="text" className={inputCls} placeholder="Apto 42, Bl. B" value={form.imovel_complemento} onChange={e => set("imovel_complemento", e.target.value)} />
                                    </Field>
                                    <Field label="Cidade - Estado">
                                        <input type="text" className={inputCls} placeholder="São Paulo - SP" value={form.imovel_cidade} onChange={e => set("imovel_cidade", e.target.value)} />
                                    </Field>
                                </div>
                                <Field label="Matrícula / Registro (opcional)">
                                    <input type="text" className={inputCls} placeholder="nº da matrícula no cartório" value={form.imovel_matricula} onChange={e => set("imovel_matricula", e.target.value)} />
                                </Field>
                            </Section>

                            {/* Chaves */}
                            <Section title="Chaves e Acessos">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Qtd. de Chaves">
                                        <input type="number" min="1" className={inputCls} value={form.chaves_qtd} onChange={e => set("chaves_qtd", e.target.value)} />
                                    </Field>
                                    <Field label="Controle / Interfone (opcional)">
                                        <input type="text" className={inputCls} placeholder="1 controle de garagem" value={form.controle_acesso} onChange={e => set("controle_acesso", e.target.value)} />
                                    </Field>
                                </div>
                                <Field label="Descrição das Chaves">
                                    <input type="text" className={inputCls} placeholder="Chave da porta principal, porta dos fundos..." value={form.chaves_descricao} onChange={e => set("chaves_descricao", e.target.value)} />
                                </Field>
                            </Section>

                            {/* Medidores */}
                            <Section title="Leituras de Medidores" defaultOpen={false}>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Matrícula Água">
                                        <input type="text" className={inputCls} placeholder="000000" value={form.agua_matricula} onChange={e => set("agua_matricula", e.target.value)} />
                                    </Field>
                                    <Field label="Leitura Atual (m³)">
                                        <input type="text" className={inputCls} placeholder="123,456" value={form.agua_leitura} onChange={e => set("agua_leitura", e.target.value)} />
                                    </Field>
                                    <Field label="Instalação Energia">
                                        <input type="text" className={inputCls} placeholder="000000000" value={form.luz_instalacao} onChange={e => set("luz_instalacao", e.target.value)} />
                                    </Field>
                                    <Field label="Leitura Atual (kWh)">
                                        <input type="text" className={inputCls} placeholder="4.321" value={form.luz_leitura} onChange={e => set("luz_leitura", e.target.value)} />
                                    </Field>
                                    <Field label="Medidor Gás">
                                        <input type="text" className={inputCls} placeholder="G00000" value={form.gas_medidor} onChange={e => set("gas_medidor", e.target.value)} />
                                    </Field>
                                    <Field label="Leitura Atual (m³)">
                                        <input type="text" className={inputCls} placeholder="00,000" value={form.gas_leitura} onChange={e => set("gas_leitura", e.target.value)} />
                                    </Field>
                                </div>
                            </Section>

                            {/* Estado Geral */}
                            <Section title="Estado Geral e Observações">
                                <Field label="Condição do Imóvel na Entrega" required>
                                    <select className={selectCls} value={form.estado_geral} onChange={e => set("estado_geral", e.target.value as any)}>
                                        <option value="otimo">Ótimo</option>
                                        <option value="bom">Bom</option>
                                        <option value="regular">Regular</option>
                                        <option value="necessita_reparos">Necessita Reparos</option>
                                    </select>
                                </Field>
                                <Field label="Observações (danos, itens inclusos, ressalvas, etc.)">
                                    <textarea
                                        className={inputCls}
                                        rows={4}
                                        placeholder="Ex: Porta do quarto necessita ajuste. Inclui churrasqueira e ar-condicionado."
                                        value={form.observacoes}
                                        onChange={e => set("observacoes", e.target.value)}
                                    />
                                </Field>
                            </Section>

                            {/* Testemunhas */}
                            <Section title="Testemunhas" defaultOpen={false}>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Testemunha 1 — Nome">
                                        <input type="text" className={inputCls} placeholder="Nome completo" value={form.testemunha1_nome} onChange={e => set("testemunha1_nome", e.target.value)} />
                                    </Field>
                                    <Field label="Testemunha 1 — CPF">
                                        <input type="text" className={inputCls} placeholder="000.000.000-00" value={form.testemunha1_cpf} onChange={e => set("testemunha1_cpf", e.target.value)} />
                                    </Field>
                                    <Field label="Testemunha 2 — Nome">
                                        <input type="text" className={inputCls} placeholder="Nome completo" value={form.testemunha2_nome} onChange={e => set("testemunha2_nome", e.target.value)} />
                                    </Field>
                                    <Field label="Testemunha 2 — CPF">
                                        <input type="text" className={inputCls} placeholder="000.000.000-00" value={form.testemunha2_cpf} onChange={e => set("testemunha2_cpf", e.target.value)} />
                                    </Field>
                                </div>
                            </Section>

                            {/* Corretor */}
                            <Section title="Dados do Intermediário (Corretor / Imobiliária)" defaultOpen={false}>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Nome">
                                        <input type="text" className={inputCls} placeholder="Nome do corretor" value={form.corretor_nome} onChange={e => set("corretor_nome", e.target.value)} />
                                    </Field>
                                    <Field label="CRECI">
                                        <input type="text" className={inputCls} placeholder="00000-F" value={form.corretor_creci} onChange={e => set("corretor_creci", e.target.value)} />
                                    </Field>
                                </div>
                            </Section>

                            {/* Logomarca / Brand */}
                            <Section title="🏷️ Identidade Visual (opcional)" defaultOpen={false}>
                                <p className="text-xs text-slate-500">
                                    Personalize o cabeçalho do documento com sua logo ou nome da empresa.
                                </p>

                                {/* Upload de Logo */}
                                <Field label="Logomarca (PNG, JPG, SVG)">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoUpload}
                                    />
                                    {logoBase64 ? (
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                            <img src={logoBase64} alt="Logo preview" className="h-12 max-w-[120px] object-contain rounded" />
                                            <div className="flex-1">
                                                <p className="text-xs text-slate-600 font-medium">Logo carregada ✅</p>
                                                <p className="text-[10px] text-slate-400">Aparece no cabeçalho do documento</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => { setLogoBase64(undefined); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-300 hover:bg-brand-50/40 transition-all text-left"
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                                <ImageIcon className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">Clique para enviar sua logo</p>
                                                <p className="text-xs text-slate-400">PNG, JPG ou SVG — recomendado fundo transparente</p>
                                            </div>
                                            <Upload className="h-4 w-4 text-slate-400 ml-auto" />
                                        </button>
                                    )}
                                </Field>

                                {/* Alternativa: Nome como marca */}
                                {!logoBase64 && (
                                    <Field label="Ou use o nome da empresa como marca">
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                className={`${inputCls} pl-9`}
                                                placeholder="Ex: Imobiliária Horizonte ou João Araújo Corretor"
                                                value={brandName}
                                                onChange={e => setBrandName(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1">Aparece em destaque no cantos superior esquerdo do documento — ideal para quem não tem logo</p>
                                    </Field>
                                )}
                            </Section>
                        </div>
                    )}

                    {/* ── DOCUMENT PREVIEW ── */}
                    <div className={preview ? "max-w-4xl mx-auto w-full" : ""}>
                        <div className="sticky top-20">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-brand-500" />
                                    Pré-visualização do Documento
                                </p>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="secondary" leftIcon={<Share2 className="h-3.5 w-3.5" />} onClick={handleShare}>
                                        WhatsApp
                                    </Button>
                                    <Button size="sm" leftIcon={<Printer className="h-3.5 w-3.5" />} onClick={handlePrint}>
                                        Imprimir / PDF
                                    </Button>
                                </div>
                            </div>

                            {/* A4 Paper Shadow */}
                            <div className="bg-slate-200 rounded-2xl p-4 overflow-auto max-h-[75vh]">
                                <div className="bg-white shadow-2xl rounded-sm p-10 min-h-[842px]"
                                    style={{ width: "100%", maxWidth: "794px", margin: "0 auto" }}>
                                    <DocumentPreview form={form} logoBase64={logoBase64} brandName={brandName} />
                                </div>
                            </div>

                            <div className="mt-3 flex items-start gap-2 text-xs text-slate-400">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <p>Use <strong>Imprimir / PDF</strong> para salvar como PDF (no diálogo de impressão, selecione "Salvar como PDF"). O documento será formatado automaticamente em A4.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
