"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export default function LogoPreviewPage() {
    const [bgDark, setBgDark] = useState(true);

    return (
        <div className={`min-h-screen p-8 transition-colors duration-500 ${bgDark ? "bg-slate-900" : "bg-white"}`}>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-end border-b border-slate-500/30 pb-4">
                    <div>
                        <h1 className={`text-2xl font-bold ${bgDark ? 'text-white' : 'text-slate-900'}`}>
                            Logos Vetorizadas Exclusivas (SVG 100% Transparentes)
                        </h1>
                        <p className={`text-sm mt-1 ${bgDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Estas versões não são imagens (PNG normais). São cálculos matemáticos (Vetor/SVG) desenhados agora.
                            Nunca terão fundo branco ou quadrado e podem ser impressas até em outdoors sem perder qualidade.
                        </p>
                    </div>
                    <button
                        onClick={() => setBgDark(!bgDark)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${bgDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                            }`}
                    >
                        Trocar para Fundo {bgDark ? "Claro" : "Escuro"}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* OPÇÃO 1 */}
                    <LogoCard
                        title="Opção 1: O Clássico Tech"
                        description="Letra D sólida com telhado integrado e spark em ciano. Fonte encorpada e forte."
                        bgDark={bgDark}
                    >
                        <svg width="240" height="60" viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Telhado */}
                            <path d="M4 25L24 5L44 25" stroke={bgDark ? "#60A5FA" : "#1E3A8A"} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                            {/* Letra D e Casa (Metade esquerda) */}
                            <path d="M12 25V55H24" stroke={bgDark ? "#60A5FA" : "#1E3A8A"} strokeWidth="5" strokeLinecap="square" />
                            <path d="M12 25V55H24C36 55 42 45 42 35C42 27 36 22 26 22H12" stroke={bgDark ? "#60A5FA" : "#1E3A8A"} strokeWidth="5" strokeLinecap="square" />

                            {/* Símbolo "Spark" da IA */}
                            <path d="M26 35L30 30M32 35L36 30" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" />
                            <circle cx="28" cy="30" r="2.5" fill="#06B6D4" />
                            <circle cx="34" cy="27" r="1.5" fill="#06B6D4" />

                            {/* Texto DOMVIA */}
                            <text x="56" y="44" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="36" fill={bgDark ? "#FFFFFF" : "#0F172A"} className="tracking-tighter uppercase">DOMVIA</text>
                        </svg>
                    </LogoCard>

                    {/* OPÇÃO 2 */}
                    <LogoCard
                        title="Opção 2: Elegante / Moderno"
                        description="Linhas mais finas e sofisticadas. Foco premium, mercado imobiliário de alto padrão."
                        bgDark={bgDark}
                    >
                        <svg width="240" height="60" viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Símbolo Abstrato Casa+D */}
                            <path d="M10 50V25L24 10L38 25V40" stroke={bgDark ? "#A5B4FC" : "#3730A3"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 50H24C34 50 40 43 40 33C40 23 34 18 24 18H10" stroke={bgDark ? "#818CF8" : "#4F46E5"} strokeWidth="3" fill="none" />

                            {/* Spark Estrela minimalista */}
                            <path d="M25 28L28 35L35 38L28 41L25 48L22 41L15 38L22 35Z" fill="#06B6D4" />

                            {/* Texto DOMVIA (Tracking maior, mais elegante) */}
                            <text x="54" y="42" fontFamily="Inter, sans-serif" fontWeight="300" fontSize="32" fill={bgDark ? "#F8FAFC" : "#1E293B"} letterSpacing="4">DOMVIA</text>
                        </svg>
                    </LogoCard>

                    {/* OPÇÃO 3 */}
                    <LogoCard
                        title="Opção 3: Velocidade / Funil"
                        description="Letra D contínua com traços de aceleração. Forte foco em tech e inovação."
                        bgDark={bgDark}
                    >
                        <svg width="240" height="60" viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* O formato do Funil/Casa */}
                            <path d="M8 20L20 6L32 20" stroke={bgDark ? "#F8FAFC" : "#0F172A"} strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
                            <path d="M8 54V20H20C34 20 42 28 42 38C42 48 34 54 20 54H8Z" fill={bgDark ? "#1E3A8A" : "#DBEAFE"} />

                            <path d="M22 28L14 36M28 32L16 44" stroke={bgDark ? "#38BDF8" : "#0284C7"} strokeWidth="4" strokeLinecap="round" />

                            {/* Texto DOMVIA (Médio) */}
                            <text x="56" y="44" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="36" fill={bgDark ? "#FFFFFF" : "#0F172A"} className="uppercase">dom<tspan fill="#06B6D4">via</tspan></text>
                        </svg>
                    </LogoCard>
                </div>

                <div className="pt-8 mt-12 border-t border-slate-500/30">
                    <h2 className={`text-xl font-bold mb-6 ${bgDark ? 'text-white' : 'text-slate-900'}`}>Versões App Icon (Para Celular e Favicon)</h2>
                    <div className="flex gap-8 flex-wrap">
                        {/* ICONE APP OPÇÃO 1 */}
                        <div className={`p-6 rounded-3xl ${bgDark ? 'bg-slate-800' : 'bg-slate-100'} flex flex-col items-center gap-4`}>
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-xl">
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 32V8M10 32H18C26 32 30 26 30 20C30 14 26 8 18 8H10" stroke="white" strokeWidth="4" strokeLinecap="square" />
                                    <path d="M20 20L32 8" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                    <circle cx="32" cy="8" r="3" fill="white" />
                                </svg>
                            </div>
                            <span className={`text-sm font-semibold ${bgDark ? 'text-slate-300' : 'text-slate-600'}`}>Estilo 1 (Sólido)</span>
                        </div>

                        {/* ICONE APP OPÇÃO 2 */}
                        <div className={`p-6 rounded-3xl ${bgDark ? 'bg-slate-800' : 'bg-slate-100'} flex flex-col items-center gap-4`}>
                            <div className="w-20 h-20 rounded-2xl border-2 border-slate-200/20 bg-black flex items-center justify-center shadow-lg">
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 20V5L15 2L25 5V20C25 28 20 35 15 38C10 35 5 28 5 20Z" stroke="#38BDF8" strokeWidth="2.5" fill="#0F172A" />
                                    <path d="M10 20H15C20 20 20 15 20 15C20 15 20 10 15 10H10V25" stroke="white" strokeWidth="2" strokeLinecap="square" />
                                </svg>
                            </div>
                            <span className={`text-sm font-semibold ${bgDark ? 'text-slate-300' : 'text-slate-600'}`}>Estilo 2 (Dark)</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function LogoCard({ title, description, bgDark, children }: { title: string, description: string, bgDark: boolean, children: React.ReactNode }) {
    return (
        <div className={`p-6 rounded-2xl border transition-colors ${bgDark
                ? 'bg-slate-800/50 border-white/10 hover:bg-slate-800'
                : 'bg-white border-slate-200 hover:shadow-lg'
            }`}>
            <div className="h-32 mb-6 flex items-center justify-center bg-black/5 rounded-xl border border-black/5 overflow-hidden">
                {children}
            </div>
            <h3 className={`font-bold text-lg ${bgDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
            <p className={`text-sm mt-2 ${bgDark ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
        </div>
    );
}
