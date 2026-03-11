"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Ruler, Copy, CheckCheck, Info } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────
function calcRetangle(w: number, l: number) { return w * l; }
function calcTriangle(b: number, h: number) { return (b * h) / 2; }
function calcTrapezoid(a: number, b: number, h: number) { return ((a + b) / 2) * h; }
function calcIrregular(points: { x: number; y: number }[]) {
    // Shoelace formula
    const n = points.length;
    if (n < 3) return 0;
    let area = 0;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
    }
    return Math.abs(area / 2);
}

const formatArea = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatM2 = (v: number) => `${formatArea(v)} m²`;
const inputCls = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none bg-white";

// ── Irregular Points Manager ──────────────────────────────
function IrregularInput({ points, onChange }: {
    points: { x: number; y: number }[];
    onChange: (p: { x: number; y: number }[]) => void;
}) {
    const update = (i: number, axis: "x" | "y", v: string) => {
        const next = [...points];
        next[i] = { ...next[i], [axis]: Number(v) };
        onChange(next);
    };
    const add = () => onChange([...points, { x: 0, y: 0 }]);
    const remove = (i: number) => onChange(points.filter((_, idx) => idx !== i));

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-slate-600">Coordenadas dos vértices (metros)</p>
                <button type="button" onClick={add} className="text-xs text-brand-600 font-bold hover:text-brand-700">+ Adicionar ponto</button>
            </div>
            <div className="grid grid-cols-5 gap-2 text-xs text-slate-500 font-semibold px-1">
                <span className="col-span-1">Ponto</span>
                <span className="col-span-2">X (largura)</span>
                <span className="col-span-2">Y (comprimento)</span>
            </div>
            {points.map((p, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 items-center">
                    <span className="text-xs text-slate-400 font-bold col-span-1">P{i + 1}</span>
                    <input type="number" className={`${inputCls} col-span-2`} value={p.x} onChange={e => update(i, "x", e.target.value)} />
                    <input type="number" className={`${inputCls} col-span-2`} value={p.y} onChange={e => update(i, "y", e.target.value)} />
                    {points.length > 3 && (
                        <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 text-lg col-span-1 justify-self-end">×</button>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Result Card ───────────────────────────────────────────
function ResultCard({ area, pricePerM2 }: { area: number; pricePerM2: string }) {
    const [copied, setCopied] = useState(false);
    const price = Number(pricePerM2);
    const totalValue = price > 0 ? area * price : null;

    const copy = () => {
        navigator.clipboard.writeText(`${formatArea(area)} m²`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-6 rounded-3xl bg-gradient-to-br from-brand-600 to-purple-700 text-white p-6 shadow-xl shadow-brand-200">
            <p className="text-brand-100/80 text-xs font-bold uppercase tracking-widest mb-1">Área Total Calculada</p>
            <div className="flex items-center gap-3">
                <p className="text-4xl font-black">{formatArea(area)}<span className="text-xl ml-1">m²</span></p>
                <button onClick={copy} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                    {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="bg-white/10 rounded-2xl p-3">
                    <p className="text-white/60 text-[10px] uppercase font-bold mb-1">Hectares</p>
                    <p className="font-bold">{formatArea(area / 10000)} ha</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3">
                    <p className="text-white/60 text-[10px] uppercase font-bold mb-1">Alqueires (SP)</p>
                    <p className="font-bold">{formatArea(area / 24200)} alq.</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3">
                    <p className="text-white/60 text-[10px] uppercase font-bold mb-1">Pés quadrados</p>
                    <p className="font-bold">{formatArea(area * 10.7639)} ft²</p>
                </div>
            </div>
            {totalValue !== null && (
                <div className="mt-3 bg-white/15 rounded-2xl p-3">
                    <p className="text-white/60 text-[10px] uppercase font-bold mb-1">Valor Estimado (R$ {Number(pricePerM2).toLocaleString("pt-BR")}/m²)</p>
                    <p className="text-xl font-black">{totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                </div>
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────
type Shape = "retangulo" | "triangulo" | "trapezio" | "irregular";

export default function LandCalculatorPage() {
    const [shape, setShape] = useState<Shape>("retangulo");
    const [pricePerM2, setPricePerM2] = useState("");

    // Retângulo
    const [rectW, setRectW] = useState("");
    const [rectL, setRectL] = useState("");

    // Triângulo
    const [triBase, setTriBase] = useState("");
    const [triH, setTriH] = useState("");

    // Trapézio
    const [trapA, setTrapA] = useState("");
    const [trapB, setTrapB] = useState("");
    const [trapH, setTrapH] = useState("");

    // Irregular
    const [points, setPoints] = useState([
        { x: 0, y: 0 }, { x: 20, y: 0 }, { x: 18, y: 15 }, { x: 5, y: 16 }
    ]);

    const area = (() => {
        if (shape === "retangulo") return calcRetangle(Number(rectW), Number(rectL));
        if (shape === "triangulo") return calcTriangle(Number(triBase), Number(triH));
        if (shape === "trapezio") return calcTrapezoid(Number(trapA), Number(trapB), Number(trapH));
        if (shape === "irregular") return calcIrregular(points);
        return 0;
    })();

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/tools"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                <div>
                    <h1 className="font-display text-2xl font-bold text-slate-900">Calculadora de Terrenos</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Calcule áreas em qualquer formato, com conversão de unidades</p>
                </div>
            </div>

            {/* Shape selector */}
            <Card padding="md" className="space-y-4">
                <h2 className="font-display font-bold text-slate-800">Formato do Terreno</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {([
                        { value: "retangulo", label: "Retângulo", icon: "▬" },
                        { value: "triangulo", label: "Triângulo", icon: "▲" },
                        { value: "trapezio", label: "Trapézio", icon: "⏢" },
                        { value: "irregular", label: "Irregular", icon: "⬠" },
                    ] as const).map(s => (
                        <button
                            key={s.value}
                            onClick={() => setShape(s.value)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 font-medium text-sm transition-all ${shape === s.value
                                ? "border-brand-500 bg-brand-50 text-brand-700"
                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                                }`}
                        >
                            <span className="text-2xl">{s.icon}</span>
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Fields per shape */}
                <div className="space-y-4 pt-2">
                    {shape === "retangulo" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Largura (m)</label>
                                <input type="number" className={inputCls} placeholder="20" value={rectW} onChange={e => setRectW(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Comprimento (m)</label>
                                <input type="number" className={inputCls} placeholder="50" value={rectL} onChange={e => setRectL(e.target.value)} />
                            </div>
                        </div>
                    )}
                    {shape === "triangulo" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Base (m)</label>
                                <input type="number" className={inputCls} placeholder="30" value={triBase} onChange={e => setTriBase(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Altura (m)</label>
                                <input type="number" className={inputCls} placeholder="20" value={triH} onChange={e => setTriH(e.target.value)} />
                            </div>
                        </div>
                    )}
                    {shape === "trapezio" && (
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Base Maior (m)</label>
                                <input type="number" className={inputCls} placeholder="40" value={trapA} onChange={e => setTrapA(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Base Menor (m)</label>
                                <input type="number" className={inputCls} placeholder="25" value={trapB} onChange={e => setTrapB(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Altura (m)</label>
                                <input type="number" className={inputCls} placeholder="15" value={trapH} onChange={e => setTrapH(e.target.value)} />
                            </div>
                        </div>
                    )}
                    {shape === "irregular" && (
                        <>
                            <div className="flex items-start gap-2 p-3 bg-brand-50 rounded-xl text-xs text-brand-700">
                                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                <span>Insira as coordenadas X e Y de cada vértice do terreno. Use as medições da matrícula ou planta. A fórmula de Gauss (shoelace) calcula a área poligonal exata.</span>
                            </div>
                            <IrregularInput points={points} onChange={setPoints} />
                        </>
                    )}
                </div>

                {/* Price per m2 */}
                <div className="pt-2 border-t border-slate-100">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Valor por m² (opcional — para estimar preço total)
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                        <input
                            type="number"
                            className={`${inputCls} pl-9`}
                            placeholder="1.200"
                            value={pricePerM2}
                            onChange={e => setPricePerM2(e.target.value)}
                        />
                    </div>
                </div>

                {/* Result */}
                {area > 0 && <ResultCard area={area} pricePerM2={pricePerM2} />}
            </Card>

            {/* Reference table */}
            <Card padding="md">
                <h2 className="font-display font-bold text-slate-800 mb-3">Tabela de Referência — Unidades de Área</h2>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-left">
                            <th className="pb-2 font-semibold text-slate-700">Unidade</th>
                            <th className="pb-2 font-semibold text-slate-700">Equivalência em m²</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                        <tr><td className="py-2">1 Hectare (ha)</td><td>10.000 m²</td></tr>
                        <tr><td className="py-2">1 Alqueire (SP)</td><td>24.200 m²</td></tr>
                        <tr><td className="py-2">1 Alqueire (MG/GO)</td><td>48.400 m²</td></tr>
                        <tr><td className="py-2">1 Acre</td><td>4.046,86 m²</td></tr>
                        <tr><td className="py-2">1 Pé quadrado (ft²)</td><td>0,0929 m²</td></tr>
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
