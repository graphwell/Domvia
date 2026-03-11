import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle, X } from "lucide-react";
import type { Plan } from "@/types";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export function PricingSection({ plans }: { plans: Plan[] }) {
    return (
        <section id="planos" className="py-24 bg-surface-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-brand-600 font-semibold text-sm uppercase tracking-wider mb-3">Planos</p>
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
                        Plano certo para cada{" "}
                        <span className="gradient-text">momento da carreira</span>
                    </h2>
                    <p className="mt-4 mx-auto max-w-xl text-slate-600">
                        Comece grátis e faça upgrade conforme seu negócio cresce.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative rounded-3xl border p-8 ${plan.highlighted
                                ? "border-brand-500 bg-brand-600 text-white shadow-glow scale-[1.03]"
                                : "border-slate-200 bg-white shadow-card"
                                }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <Badge variant="gold" className="px-4 py-1 text-sm">Mais Popular</Badge>
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className={`font-display text-2xl font-bold mb-2 ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                                    {plan.name}
                                </h3>
                                <div className="flex items-end gap-1">
                                    {plan.price === 0 ? (
                                        <span className={`font-display text-4xl font-black ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                                            Grátis
                                        </span>
                                    ) : (
                                        <>
                                            <span className={`text-sm font-medium self-start mt-2 ${plan.highlighted ? "text-brand-200" : "text-slate-500"}`}>R$</span>
                                            <span className={`font-display text-5xl font-black ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                                                {plan.price}
                                            </span>
                                            <span className={`text-sm font-medium mb-1 ${plan.highlighted ? "text-brand-200" : "text-slate-500"}`}>/mês</span>
                                        </>
                                    )}
                                </div>
                                <p className={`text-sm mt-2 ${plan.highlighted ? "text-brand-200" : "text-slate-500"}`}>
                                    {plan.creditsPerMonth} crédito{plan.creditsPerMonth > 1 ? "s" : ""}/mês •{" "}
                                    {(plan.maxLinks || 0) >= 999 || plan.maxLinks === -1 ? "Links ilimitados" : `${plan.maxLinks} links`}
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature.label} className="flex items-center gap-3 text-sm">
                                        {feature.included ? (
                                            <CheckCircle className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-brand-200" : "text-emerald-500"}`} />
                                        ) : (
                                            <X className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-brand-400" : "text-slate-300"}`} />
                                        )}
                                        <span className={feature.included
                                            ? (plan.highlighted ? "text-white" : "text-slate-700")
                                            : (plan.highlighted ? "text-brand-300" : "text-slate-400")
                                        }>
                                            {feature.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/register">
                                <Button
                                    size="lg"
                                    variant={plan.highlighted ? "gold" : "primary"}
                                    className="w-full"
                                >
                                    {plan.price === 0 ? "Começar Grátis" : `Assinar ${plan.name}`}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
