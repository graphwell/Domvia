import { Button } from "@/components/ui/Button";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export function CTASection() {
    return (
        <section className="py-24 bg-white">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-8 py-16 sm:px-16 text-center">
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-500/40 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/30 blur-3xl" />

                    <div className="relative space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white">
                            <Zap className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                            Comece hoje — é grátis, sem cartão
                        </div>

                        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                            Sua concorrência já está<br />
                            usando IA para vender mais
                        </h2>

                        <p className="mx-auto max-w-xl text-brand-100 text-lg">
                            Em 30 segundos você cria sua conta, cadastra o primeiro imóvel e já tem um link inteligente pronto para compartilhar — sem cartão de crédito.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/register">
                                <Button size="xl" variant="gold" className="min-w-[240px]">
                                    Começar Grátis Agora
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                        </div>

                        <p className="text-brand-300 text-sm">
                            ✓ Sem cartão de crédito &nbsp;&nbsp; ✓ Tour 360° grátis &nbsp;&nbsp; ✓ Cancele quando quiser
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
