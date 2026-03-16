"use client";

import { AppSidebar, MobileNav } from "@/components/layout/AppSidebar";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { DomviaLogo } from "@/components/layout/Header";
import { Bell, Search, Menu, X, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { FloatingIntelligentButton } from "@/components/dashboard/FloatingIntelligentButton";
import { FeedbackPrompt } from "@/components/dashboard/FeedbackPrompt";
import { InstallPWA } from "@/components/dashboard/InstallPWA";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/auth-provider";
import { useRouter } from "next/navigation";
import { NotificationProvider, useNotifications, NotificationItem } from "@/context/NotificationContext";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { ptBR } from "date-fns/locale/pt-BR";
import { triggerHaptic } from "@/lib/haptic";

import { CreditCounter } from "@/components/dashboard/CreditCounter";

function NotificationBell() {
    const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    
    const toggleOpen = () => {
        triggerHaptic('light');
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative">
            <button 
                onClick={toggleOpen}
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors z-[60]"
            >
                <Bell className={cn("h-5 w-5", unreadCount > 0 && "animate-shake origin-top")} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brand-600 animate-pulse" />
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[90] bg-slate-900/10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 space-y-2 bg-white border border-slate-200 shadow-2xl rounded-2xl z-[110] overflow-hidden min-w-[320px] animate-fade-in">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">Notificações</h3>
                                {unreadCount > 0 && (
                                    <span className="text-[10px] text-brand-600 font-bold">
                                        {unreadCount} novas
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={() => markAllAsRead()}
                                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-lg font-bold transition-colors"
                                >
                                    Ler todas
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-slate-50">
                                    {notifications.slice(0, 5).map((n) => (
                                        <div 
                                            key={n.id} 
                                            className={cn("p-4 hover:bg-slate-50 transition-colors cursor-pointer border-l-4", n.read ? "border-transparent opacity-60" : "bg-brand-50/30 border-brand-500")}
                                            onClick={() => markAsRead(n.id)}
                                        >
                                            <div className="flex gap-3">
                                                <div className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                                    n.type === 'credit' ? "bg-amber-100 text-amber-600" :
                                                    n.type === 'lead' ? "bg-blue-100 text-blue-600" :
                                                    n.type === 'engagement' ? "bg-purple-100 text-purple-600" :
                                                    "bg-slate-100 text-slate-600"
                                                )}>
                                                    <Bell className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{n.title}</p>
                                                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                                                    <p className="text-[9px] text-slate-400 mt-1 font-medium italic">
                                                        {formatDistanceToNow(n.timestamp, { addSuffix: true, locale: ptBR })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                        <Bell className="h-6 w-6" />
                                    </div>
                                    <p className="text-xs font-medium">Você não tem notificações no momento.</p>
                                </div>
                            )}
                        </div>

                        <Link 
                            href="/notifications" 
                            className="block p-3 text-center border-t border-slate-100 text-[11px] font-bold text-brand-600 hover:bg-brand-50 transition-colors uppercase tracking-wider bg-white"
                            onClick={() => setIsOpen(false)}
                        >
                            Ver todas as notificações
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { t } = useLanguage();
    const { user, isLoading } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            console.log("[Dashboard] No user found, redirecting to login...");
            router.replace("/login");
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
                    <p className="text-slate-400 text-sm font-medium">Sincronizando acesso...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <NotificationProvider>
            <div className={cn(
                "flex min-h-screen bg-surface-50 max-w-[100vw] overflow-x-hidden",
                user?.planId === 'pro' ? 'theme-pro' : user?.planId === 'elite' ? 'theme-elite' : ''
            )}>
                {/* Sidebar - Desktop */}
                <AppSidebar />

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Topbar */}
                    <header className="sticky top-0 z-[100] glass border-b border-slate-200/60">
                        <div className="flex items-center h-16 px-2 sm:px-6 gap-1 sm:gap-4">
                            {/* Mobile hamburger & logo */}
                            <div className="flex lg:hidden items-center gap-1.5">
                                <button 
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    <Menu className="h-6 w-6" />
                                </button>
                                <div className="-ml-1.5 shrink-0">
                                    <DomviaLogo />
                                </div>
                            </div>

                            {/* Search */}
                            <div className="hidden lg:flex flex-1 max-w-xs">
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="search"
                                        placeholder={t("common.search_placeholder")}
                                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="ml-auto flex items-center gap-1 sm:gap-2">
                                {/* Credits Counter - Mobile & Desktop */}
                                <CreditCounter />

                                {/* Language Selector */}
                                <div className="hidden sm:block">
                                    <LanguageSelector />
                                </div>

                                {user && (
                                    <Link 
                                        href="/convite" 
                                        className="flex items-center gap-1 px-2 sm:gap-1.5 sm:px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 hover:bg-brand-100 transition-all shadow-sm active:scale-95 animate-pulse-gentle"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-tight hidden sm:inline">Convide</span>
                                    </Link>
                                )}

                                {/* Notification bell */}
                                <NotificationBell />

                                {/* Avatar */}
                                <UserAvatar />
                            </div>
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 p-3 sm:p-6 pb-24 lg:pb-6 overflow-x-hidden w-full max-w-[100vw]">
                        {children}
                    </main>

                    {/* Dashboard Footer */}
                    <footer className="p-4 sm:px-6 border-t border-slate-200/60 text-center">
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                            {t("common.developed_by_somar") || "Desenvolvido por Somar Soluções Digitais"}
                        </p>
                    </footer>
                </div>

                {/* Global Floating Action Button for Quick Capture - Mobile Only */}
                <FloatingIntelligentButton />

                {/* Smart Feedback Prompt */}
                <FeedbackPrompt />

                {/* PWA Install Facilitator */}
                <InstallPWA />

                {/* Mobile bottom nav */}
                <MobileNav />
                {/* Mobile Sidebar Drawer Overlay */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity animate-in fade-in duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <div 
                            className="absolute left-0 top-0 bottom-0 w-56 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex h-16 items-center px-4 border-b border-slate-200 justify-between">
                                <DomviaLogo />
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2">
                                <AppSidebar mobileMode onClose={() => setIsMobileMenuOpen(false)} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </NotificationProvider>
    );
}
