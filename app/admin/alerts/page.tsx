"use client";

import { useState, useEffect } from "react";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, update, query, orderByKey, limitToLast } from "firebase/database";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
    AlertTriangle, ShieldAlert, Info, CheckCircle, 
    Trash2, ExternalLink, User, Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { triggerHaptic } from "@/lib/haptic";

interface AdminAlert {
    id: string;
    userId: string;
    userName?: string;
    toolId: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    context?: any;
    timestamp: number;
    read: boolean;
}

export default function AdminAlertsPage() {
    const [alerts, setAlerts] = useState<AdminAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const alertsRef = query(ref(rtdb, 'admin/alerts'), limitToLast(50));
        const unsubscribe = onValue(alertsRef, (snap) => {
            if (snap.exists()) {
                const data = snap.val();
                const list = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                })).sort((a, b) => b.timestamp - a.timestamp);
                setAlerts(list);
            } else {
                setAlerts([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const markAsRead = async (id: string) => {
        triggerHaptic('light');
        await update(ref(rtdb, `admin/alerts/${id}`), { read: true });
    };

    const deleteAlert = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este alerta?")) return;
        triggerHaptic('medium');
        await update(ref(rtdb, `admin/alerts/${id}`), { id: null }); // Firebase delete by setting null
    };

    const getSeverityIcon = (sev: string) => {
        switch (sev) {
            case 'critical': return <ShieldAlert className="h-5 w-5 text-red-600" />;
            case 'error': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getSeverityBadge = (sev: string) => {
        switch (sev) {
            case 'critical': return <Badge variant="destructive">Crítico</Badge>;
            case 'error': return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Erro</Badge>;
            case 'warning': return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Aviso</Badge>;
            default: return <Badge variant="secondary">Info</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-slate-900">Alertas do Sistema</h1>
                    <p className="text-slate-500 text-sm">Monitoramento em tempo real de erros e atividades críticas</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="px-3 py-1">
                        {alerts.filter(a => !a.read).length} não lidos
                    </Badge>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                </div>
            ) : alerts.length === 0 ? (
                <Card padding="lg" className="text-center py-20 text-slate-500">
                    <CheckCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p>Nenhum alerta registrado no momento.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <Card 
                            key={alert.id} 
                            padding="md" 
                            className={`transition-all border-l-4 ${
                                !alert.read ? 'border-l-brand-600 bg-brand-50/30' : 'border-l-slate-200'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-xl bg-white shadow-sm shrink-0`}>
                                    {getSeverityIcon(alert.severity)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getSeverityBadge(alert.severity)}
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {alert.toolId}
                                        </span>
                                        <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {format(alert.timestamp, "dd MMM, HH:mm", { locale: ptBR })}
                                        </span>
                                    </div>
                                    
                                    <h3 className={`text-sm font-semibold mb-1 ${!alert.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                        {alert.message}
                                    </h3>
                                    
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <User className="h-3 w-3" />
                                            {alert.userName || 'Usuário'} ({alert.userId.slice(0, 6)}...)
                                        </div>
                                        
                                        {alert.context && (
                                            <div className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono truncate max-w-xs">
                                                {JSON.stringify(alert.context)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {!alert.read && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => markAsRead(alert.id)}
                                            title="Marcar como lido"
                                        >
                                            <CheckCircle className="h-4 w-4 text-brand-600" />
                                        </Button>
                                    )}
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => deleteAlert(alert.id)}
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
