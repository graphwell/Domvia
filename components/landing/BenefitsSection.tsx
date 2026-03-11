import { Card } from "@/components/ui/Card";
import { Brain, Zap, TrendingUp, Calculator, Smartphone, FileText } from "lucide-react";

const benefits = [
    {
        icon: Brain,
        title: "IA que responde 24h no lugar do corretor",
        description: "Cada link inteligente tem uma IA treinada para tirar dúvidas dos clientes, qualquer hora do dia — sem você precisar estar online.",
        color: "text-brand-600 bg-brand-50",
    },
    {
        icon: TrendingUp,
        title: "Links inteligentes que qualificam o cliente sozinho",
        description: "O cliente acessa, a IA conversa, detecta intenção de compra e entrega o lead já qualificado pro corretor fechar.",
        color: "text-emerald-600 bg-emerald-50",
    },
    {
        icon: Zap,
        title: "Página profissional do imóvel em 47 segundos",
        description: "Preencha os dados básicos e a Domvia gera uma página linda, mobile-first, pronta para compartilhar em qualquer canal.",
        color: "text-gold-600 bg-gold-50",
    },
    {
        icon: Calculator,
        title: "Calculadora de financiamento embutida",
        description: "O cliente simula parcelas, entrada mínima e total direto na página do imóvel. Mais engajamento, lead mais quente.",
        color: "text-purple-600 bg-purple-50",
    },
    {
        icon: Smartphone,
        title: "Feito para funcionar no celular",
        description: "O corretor cria o link no celular, o cliente acessa pelo WhatsApp. Zero fricção. 100% mobile do começo ao fim.",
        color: "text-pink-600 bg-pink-50",
    },
    {
        icon: FileText,
        title: "Gerador de documentos imobiliários",
        description: "Recibos, propostas, autorizações e mais — gerados por formulário ou IA, assinados digitalmente e enviados na hora.",
        color: "text-cyan-600 bg-cyan-50",
    },
];

export function BenefitsSection() {
    return (
        <section id="beneficios" className="py-24 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-brand-600 font-semibold text-sm uppercase tracking-wider mb-3">Por que a Domvia</p>
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
                        Tudo que o corretor precisa para{" "}
                        <span className="gradient-text">vender mais</span>
                    </h2>
                    <p className="mt-4 mx-auto max-w-xl text-slate-600">
                        Uma plataforma que substitui 5 ferramentas diferentes — por uma fração do preço e com o dobro de resultado.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((benefit, i) => (
                        <Card key={benefit.title} hover className={`animate-fade-up delay-${(i % 3) * 100}`}>
                            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-4 ${benefit.color}`}>
                                <benefit.icon className="h-6 w-6" />
                            </div>
                            <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
