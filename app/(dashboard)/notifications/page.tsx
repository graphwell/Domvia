"use client";

import { useNotifications } from "@/context/NotificationContext";
import { Bell, CreditCard, UserPlus, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { ptBR } from "date-fns/locale/pt-BR";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export default function NotificationsPage() {
    const { notifications } = useNotifications();

    const getIcon = (type: string) => {
        switch (type) {
            case 'credit': return <CreditCard className="h-5 w-5" />;
            case 'lead': return <UserPlus className="h-5 w-5" />;
            case 'achievement': return <Zap className="h-5 w-5" />;
            default: return <Bell className="h-5 w-5" />;
        }
    };

    const getColors = (type: string) => {
        switch (type) {
            case 'credit': return "bg-amber-100 text-amber-600";
            case 'lead': return "bg-blue-100 text-blue-600";
            case 'achievement': return "bg-purple-100 text-purple-600";
            default: return "bg-slate-100 text-slate-600";
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Suas Notificações</h1>
                    <p className="text-sm text-slate-500 font-medium">Fique por dentro de tudo o que acontece no Domvia.</p>
                </div>
                <div className="h-12 w-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                    <Bell className="h-6 w-6 text-brand-600" />
                </div>
            </div>

            <div className="space-y-3">
                {notifications.length > 0 ? (
                    notifications.map((n) => (
                        <Card 
                            key={n.id} 
                            padding="none" 
                            className={cn(
                                "overflow-hidden transition-all hover:shadow-md",
                                !n.read && "border-l-4 border-l-brand-500 bg-brand-50/10"
                            )}
                        >
                            <div className="p-4 flex gap-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                                    getColors(n.type)
                                )}>
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-4">
                                        <h3 className="font-bold text-slate-800">{n.title}</h3>
                                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap uppercase tracking-widest">
                                            {formatDistanceToNow(n.timestamp, { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card className="p-12 text-center bg-slate-50/50 border-dashed">
                        <div className="h-16 w-16 bg-white border border-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Bell className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="font-bold text-slate-800">Sem notificações ainda</h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-[240px] mx-auto">
                            Suas atualizações e alertas de créditos aparecerão aqui quando chegarem.
                        </p>
                    </Card>
                )}
            </div>
        </div>
    );
}
