const steps = [
    {
        step: "01",
        title: "Cadastre o imóvel em 3 minutos",
        description: "Adicione fotos, preço e descrição rapidinho. A Domvia gera uma página profissional automaticamente — sem precisar de designer.",
        highlight: "3 minutos para publicar",
    },
    {
        step: "02",
        title: "Gere e compartilhe o link inteligente",
        description: "Copie o link exclusivo do imóvel e cole no Instagram, WhatsApp, Facebook, ZAP ou Google. Um link serve para tudo.",
        highlight: "1 link para todos os canais",
    },
    {
        step: "03",
        title: "IA conversa, calcula e qualifica",
        description: "O cliente acessa, a IA responde dúvidas 24h, calcula o financiamento e detecta o nível de interesse automaticamente.",
        highlight: "Lead qualificado automaticamente",
    },
    {
        step: "04",
        title: "Você recebe o lead quente e fecha mais rápido",
        description: "Você é notificado com o histórico completo da conversa. Sabe o que o cliente quer antes mesmo de ligar. Fecha muito mais rápido.",
        highlight: "Mais conversões, menos tempo",
    },
];

export function HowItWorksSection() {
    return (
        <section id="como-funciona" className="py-24 bg-surface-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-brand-600 font-semibold text-sm uppercase tracking-wider mb-3">Como Funciona</p>
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
                        Do imóvel ao lead fechado em{" "}
                        <span className="gradient-text">4 passos simples</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 hidden lg:flex w-3/4 h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 z-0" />

                    {steps.map((step, i) => (
                        <div key={step.step} className="relative z-10 text-center space-y-4 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white border-4 border-brand-100 shadow-card">
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Passo</span>
                                    <span className="font-display text-3xl font-black text-brand-600">{step.step}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-display text-lg font-bold text-slate-900">{step.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                                <span className="inline-block rounded-full bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1">
                                    {step.highlight}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
