"use client";

import { useState } from "react";
import { CheckCircle2, Phone, Monitor } from "lucide-react";
import Link from "next/link";

export default function DSparkPreviewPage() {
    const [bgDark, setBgDark] = useState(true);

    return (
        <div className={`min-h-screen p-8 transition-colors duration-500 ${bgDark ? "bg-slate-900" : "bg-white"}`}>
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="flex justify-between items-end border-b border-slate-500/30 pb-4">
                    <div>
                        <h1 className={`text-3xl font-bold ${bgDark ? 'text-white' : 'text-slate-900'}`}>
                            Preview do Vetor Oficial ("D Spark")
                        </h1>
                        <p className={`text-sm mt-2 max-w-xl ${bgDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Esta não é uma imagem importada (zero fundos brancos)! É um desenho 100% feito de cálculos matemáticos no código (SVG).
                            Reproduzi a chaminé, o telhado azul marinho escuro, a letra D robusta, os rastros de <i>spark digital</i> e a estrela ciano subindo do canto inferior esquerdo.
                        </p>
                    </div>
                    <button
                        onClick={() => setBgDark(!bgDark)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 ${bgDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                            }`}
                    >
                        Trocar para Fundo {bgDark ? "CLARO" : "ESCURO"}
                    </button>
                </div>

                {/* SÍMBOLO GIGANTE PARA VER OS DETALHES */}
                <div className={`p-16 rounded-3xl border flex flex-col items-center justify-center transition-colors shadow-2xl ${bgDark ? 'bg-[#0f172a] border-white/5' : 'bg-slate-50 border-slate-200'
                    }`}>
                    <div className="flex items-center gap-8 group">
                        {/* O Símbolo D Spark em Vetor */}
                        <svg
                            width="280"
                            height="240"
                            viewBox="0 0 200 180"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="shrink-0 transition-transform duration-500 group-hover:scale-105"
                        >
                            <defs>
                                <linearGradient id="cyan-glow" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#00E5FF" />
                                    <stop offset="100%" stopColor="#0088CC" />
                                </linearGradient>
                            </defs>

                            {/* CHAMINÉ (Esquerda) */}
                            <rect x="55" y="45" width="14" height="25" fill="#0A1C40" />

                            {/* TELHADO */}
                            <path
                                d="M20 90L100 25L180 90"
                                stroke="#0A1C40"
                                strokeWidth="18"
                                strokeLinecap="square"
                                strokeLinejoin="miter"
                            />

                            {/* LETRA D (Haste + Curva) */}
                            {/* Haste Vertical Esquerda (Cortada no fundo p/ os sparks passarem) */}
                            <path d="M62 82V160" stroke="#0A1C40" strokeWidth="18" strokeLinecap="square" />

                            {/* Curva Direita do D */}
                            <path
                                d="M62 82H100C138 82 165 105 165 135C165 160 145 180 100 180H62"
                                stroke="#0A1C40"
                                strokeWidth="22"
                                strokeLinecap="square"
                                fill="none"
                            />

                            <path
                                d="M62 180H95C138 180 155 155 155 135"
                                stroke="#0A1C40"
                                strokeWidth="22"
                                strokeLinecap="square"
                                fill="none"
                            />

                            {/* SPARK DIGITAL (Rastros Azuis) */}
                            {/* Linha grossa principal do spark, vindo da esquerda-inferior para direita-cima */}
                            <path d="M60 155L90 120" stroke="url(#cyan-glow)" strokeWidth="8" strokeLinecap="round" />
                            <circle cx="65" cy="150" r="4.5" fill="url(#cyan-glow)" />

                            {/* Linha média do spark */}
                            <path d="M80 165L105 135" stroke="url(#cyan-glow)" strokeWidth="6" strokeLinecap="round" />

                            {/* Linha fina do spark */}
                            <path d="M50 135L75 105" stroke="url(#cyan-glow)" strokeWidth="6" strokeLinecap="round" />

                            {/* Pixels espalhados (quadradinhos) */}
                            <rect x="65" y="100" width="8" height="8" transform="rotate(25 65 100)" fill="url(#cyan-glow)" />
                            <rect x="110" y="150" width="10" height="10" transform="rotate(45 110 150)" fill="url(#cyan-glow)" />
                            <rect x="145" y="105" width="6" height="6" transform="rotate(15 145 105)" fill="url(#cyan-glow)" />
                            <rect x="80" y="125" width="5" height="5" fill="url(#cyan-glow)" />

                            {/* ESTRELA GRANDE NO CENTRO (Sparkle de IA) */}
                            <path
                                d="M125 100 Q 125 125, 150 125 Q 125 125, 125 150 Q 125 125, 100 125 Q 125 125, 125 100"
                                fill="#00E5FF"
                            />
                        </svg>

                        {/* TEXTO DA MARCA */}
                        <div className="flex tracking-tight">
                            <span
                                className={`font-display font-black text-[6rem] leading-none ${bgDark ? 'text-white' : 'text-[#0A1C40]'
                                    }`}
                            >
                                DOM
                            </span>
                            <span className="font-display font-black text-[6rem] leading-none text-[#00E5FF]">
                                VIA
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {/* APLICAÇÃO NO CANTO DA TELA NAVBAR */}
                    <div className={`p-6 rounded-2xl border ${bgDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                        <div className="flex items-center gap-3 mb-4 text-sm font-bold text-slate-500">
                            <Monitor className="h-5 w-5" /> Tamanho Navbar (Header)
                        </div>
                        <div className="flex items-center gap-3">
                            <svg
                                width="40"
                                height="40"
                                viewBox="0 0 200 180"
                                fill="none"
                            >
                                <defs>
                                    <linearGradient id="cyan-glow-s" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#00E5FF" />
                                        <stop offset="100%" stopColor="#0088CC" />
                                    </linearGradient>
                                </defs>
                                <rect x="55" y="45" width="14" height="25" fill={bgDark ? "#fff" : "#0A1C40"} />
                                <path d="M20 90L100 25L180 90" stroke={bgDark ? "#fff" : "#0A1C40"} strokeWidth="18" strokeLinecap="square" strokeLinejoin="miter" />
                                <path d="M62 82V160" stroke={bgDark ? "#fff" : "#0A1C40"} strokeWidth="18" strokeLinecap="square" />
                                <path d="M62 82H100C138 82 165 105 165 135C165 160 145 180 100 180H62" stroke={bgDark ? "#fff" : "#0A1C40"} strokeWidth="22" strokeLinecap="square" fill="none" />
                                <path d="M62 180H95C138 180 155 155 155 135" stroke={bgDark ? "#fff" : "#0A1C40"} strokeWidth="22" strokeLinecap="square" fill="none" />
                                <path d="M60 155L90 120" stroke="url(#cyan-glow-s)" strokeWidth="8" strokeLinecap="round" />
                                <circle cx="65" cy="150" r="4.5" fill="url(#cyan-glow-s)" />
                                <path d="M80 165L105 135" stroke="url(#cyan-glow-s)" strokeWidth="6" strokeLinecap="round" />
                                <path d="M50 135L75 105" stroke="url(#cyan-glow-s)" strokeWidth="6" strokeLinecap="round" />
                                <rect x="65" y="100" width="8" height="8" transform="rotate(25 65 100)" fill="url(#cyan-glow-s)" />
                                <rect x="110" y="150" width="10" height="10" transform="rotate(45 110 150)" fill="url(#cyan-glow-s)" />
                                <rect x="145" y="105" width="6" height="6" transform="rotate(15 145 105)" fill="url(#cyan-glow-s)" />
                                <rect x="80" y="125" width="5" height="5" fill="url(#cyan-glow-s)" />
                                <path d="M125 100 Q 125 125, 150 125 Q 125 125, 125 150 Q 125 125, 100 125 Q 125 125, 125 100" fill="#00E5FF" />
                            </svg>
                            <span className={`font-display font-black text-2xl tracking-tight leading-none ${bgDark ? 'text-white' : 'text-[#0A1C40]'}`}>
                                DOM<span className="text-[#00E5FF]">VIA</span>
                            </span>
                        </div>
                    </div>

                    {/* APLICAÇÃO COMO ÍCONE DE APP MOBILE */}
                    <div className={`p-6 rounded-2xl border ${bgDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                        <div className="flex items-center gap-3 mb-4 text-sm font-bold text-slate-500">
                            <Phone className="h-5 w-5" /> Ícone App Celular (Favicon)
                        </div>
                        <div className="w-20 h-20 bg-[#0f172a] rounded-2xl flex items-center justify-center shadow-lg border border-slate-700">
                            <svg
                                width="50"
                                height="50"
                                viewBox="0 0 200 180"
                                fill="none"
                            >
                                <defs>
                                    <linearGradient id="cyan-glow-icon" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#00E5FF" />
                                        <stop offset="100%" stopColor="#0088CC" />
                                    </linearGradient>
                                </defs>
                                <rect x="55" y="45" width="14" height="25" fill="#ffffff" />
                                <path d="M20 90L100 25L180 90" stroke="#ffffff" strokeWidth="18" strokeLinecap="square" strokeLinejoin="miter" />
                                <path d="M62 82V160" stroke="#ffffff" strokeWidth="18" strokeLinecap="square" />
                                <path d="M62 82H100C138 82 165 105 165 135C165 160 145 180 100 180H62" stroke="#ffffff" strokeWidth="22" strokeLinecap="square" fill="none" />
                                <path d="M60 155L90 120" stroke="url(#cyan-glow-icon)" strokeWidth="8" strokeLinecap="round" />
                                <circle cx="65" cy="150" r="4.5" fill="url(#cyan-glow-icon)" />
                                <path d="M80 165L105 135" stroke="url(#cyan-glow-icon)" strokeWidth="6" strokeLinecap="round" />
                                <path d="M50 135L75 105" stroke="url(#cyan-glow-icon)" strokeWidth="6" strokeLinecap="round" />
                                <rect x="65" y="100" width="8" height="8" transform="rotate(25 65 100)" fill="url(#cyan-glow-icon)" />
                                <rect x="110" y="150" width="10" height="10" transform="rotate(45 110 150)" fill="url(#cyan-glow-icon)" />
                                <path d="M125 100 Q 125 125, 150 125 Q 125 125, 125 150 Q 125 125, 100 125 Q 125 125, 125 100" fill="#00E5FF" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center mt-12">
                    <Link href="/">
                        <button className="px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg border border-brand-500/50 flex flex-col items-center">
                            <span className="flex items-center gap-2 text-xl"><CheckCircle2 className="h-6 w-6" /> Aprovar e Aplicar</span>
                            <span className="text-xs text-brand-200 mt-1 font-normal opacity-80">(substituirá a imagem png na plataforma)</span>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
