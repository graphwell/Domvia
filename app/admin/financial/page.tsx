"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, get } from "firebase/database";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, AreaChart, Area
} from "recharts";
import {
    DollarSign, TrendingUp, Users, CreditCard, 
    ArrowUpRight, ArrowDownRight, Activity, Calendar
} from "lucide-react";

interface FinancialMetric {
    total_sales: number;
    subscription_revenue: number;
    credit_revenue: number;
    count: number;
}

export default function FinancialDashboard() {
    const [metrics, setMetrics] = useState<Record<string, FinancialMetric>>({});
    const [recentSales, setRecentSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const metricsRef = ref(rtdb, "financial_metrics");
        const salesRef = ref(rtdb, "sales");

        const unsMetrics = onValue(metricsRef, (snap) => {
            setMetrics(snap.val() ?? {});
        });

        const unsSales = onValue(salesRef, (snap) => {
            const data = snap.val() ?? {};
            const list = Object.entries(data)
                .map(([id, s]: [string, any]) => ({ id, ...s }))
                .sort((a, b) => b.created_at - a.created_at)
                .slice(0, 10);
            setRecentSales(list);
            setLoading(false);
        });

        return () => {
            unsMetrics();
            unsSales();
        };
    }, []);

    const chartData = Object.entries(metrics)
        .map(([month, data]) => ({
            month,
            revenue: data.total_sales,
            subscriptions: data.subscription_revenue,
            credits: data.credit_revenue,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMetrics = metrics[currentMonth] || { total_sales: 0, subscription_revenue: 0, credit_revenue: 0, count: 0 };
    
    // MRR Estimation (simplistic: all current month subscriptions)
    const mrr = currentMetrics.subscription_revenue;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">Dashboard Financeiro</h1>
                <p className="text-slate-500 text-sm">Acompanhamento de receita, assinaturas e vendas de créditos</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card padding="md" className="border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-9 w-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <ArrowUpRight className="h-3 w-3" /> 12%
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Receita Total (Mês)</p>
                    <p className="text-2xl font-display font-black text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentMetrics.total_sales)}
                    </p>
                </Card>

                <Card padding="md" className="border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">MRR Estimado</p>
                    <p className="text-2xl font-display font-black text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mrr)}
                    </p>
                </Card>

                <Card padding="md" className="border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-9 w-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <CreditCard className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Vendas de Créditos</p>
                    <p className="text-2xl font-display font-black text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentMetrics.credit_revenue)}
                    </p>
                </Card>

                <Card padding="md" className="border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-9 w-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Transações no Mês</p>
                    <p className="text-2xl font-display font-black text-slate-900">{currentMetrics.count}</p>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card padding="lg" className="border-slate-200">
                    <h3 className="font-display font-bold text-slate-900 mb-6">Receita Mensal</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{fontSize: 11, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 11, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                                    formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card padding="lg" className="border-slate-200">
                    <h3 className="font-display font-bold text-slate-900 mb-6">Assinaturas vs Créditos</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{fontSize: 11, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 11, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                                />
                                <Bar dataKey="subscriptions" fill="#6366f1" radius={[4, 4, 0, 0]} name="Assinaturas" />
                                <Bar dataKey="credits" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Créditos" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Recent Sales Table */}
            <Card padding="none" className="border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-display font-bold text-slate-900">Vendas Recentes</h3>
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Ver todas</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentSales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-900">{sale.userId.slice(0, 8)}...</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            sale.type === 'subscription' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                                        }`}>
                                            {sale.type === 'subscription' ? 'Assinatura' : 'Créditos'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: sale.currency.toUpperCase() }).format(sale.amount)}
                                    </td>
                                </tr>
                            ))}
                            {recentSales.length === 0 && (
                                <tr><td colSpan={4} className="py-12 text-center text-slate-400 text-sm">Nenhuma venda registrada</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
