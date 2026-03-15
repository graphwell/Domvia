"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Link2, Users, Wrench, Camera, CreditCard,
    Settings, LogOut, ChevronLeft, ChevronRight, FolderOpen, MessageSquare, Coins, Shield,
    UserPlus, LifeBuoy, Sparkles
} from "lucide-react";
import { DomviaLogo } from "@/components/layout/Header";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/auth-provider";
import { triggerHaptic } from "@/lib/haptic";

export function AppSidebar({ mobileMode = false, onClose }: { mobileMode?: boolean; onClose?: () => void }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { t } = useLanguage();

    const actualCollapsed = mobileMode ? false : collapsed;

    const NAV_ITEMS = [
        { href: "/tools/chat", icon: MessageSquare, label: t("nav.chat"), highlight: true },
        { href: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
        { href: "/links", icon: Link2, label: t("nav.links") || "Meus Links" },
        { href: "/leads", icon: Users, label: t("nav.leads") || "Leads" },
        { href: "/tools", icon: Wrench, label: t("nav.tools") },
        { href: "/tools/docs", icon: FolderOpen, label: t("nav.documents") },
        ...(user?.role === "AGENCY_ADMIN" || user?.role === "ADMIN_MASTER"
            ? [{ href: "/agency/team", icon: Shield, label: "Equipe" }]
            : []),
        { href: "/tools/captacao", icon: Camera, label: "Captação" },
        { href: "/tours", icon: FolderOpen, label: t("nav.tours") || "Tour 360°" }, 
        { href: "/credits", icon: Coins, label: "Créditos" },
        { href: "/planos", icon: CreditCard, label: t("nav.plans") },
        { href: "/help", icon: LifeBuoy, label: t("nav.help") || "Central de Ajuda" },
        { href: "/convite", icon: UserPlus, label: t("nav.invite") || "Convidar Corretores" },
    ];

    return (
        <aside
            className={cn(
                mobileMode ? "flex h-full w-full" : "hidden lg:flex transition-all duration-300 shrink-0 border-r border-slate-200 bg-white",
                !mobileMode && (actualCollapsed ? "w-16" : "w-60"),
                "flex-col"
            )}
        >
            {/* Logo - Only in desktop or if not mobile drawer (Drawer has its own header) */}
            {!mobileMode && (
                <div className="flex h-16 items-center px-4 border-b border-slate-200 gap-2">
                    <DomviaLogo collapsed={actualCollapsed} />
                    {!mobileMode && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="ml-auto p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </button>
                    )}
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 px-2 py-3 space-y-0.5">
                {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                                triggerHaptic('light');
                                if (onClose) onClose();
                            }}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                (item as any).highlight && !active
                                    ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white hover:from-brand-700 hover:to-indigo-700 shadow-sm"
                                    : active
                                        ? "bg-brand-50 text-brand-700"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 shrink-0",
                                (item as any).highlight && !active ? "text-white" : active ? "text-brand-600" : "text-slate-400"
                            )} />
                            {!actualCollapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-2 pb-4 space-y-0.5 border-t border-slate-200 pt-3">
                {!actualCollapsed && user && (
                    <div className="px-3 py-3 mb-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className={cn(
                                    "h-4 w-4",
                                    user.planId === 'max' ? "text-amber-500" : user.planId === 'pro' ? "text-brand-600" : "text-slate-400"
                                )} />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1.5 py-0.5 rounded-md border border-slate-200 bg-white">
                                    {user.planId?.toUpperCase() || 'TRIAL'}
                                </span>
                            </div>
                            <span className="text-xs font-black text-slate-700">{user.credits || 0}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div 
                                className={cn(
                                    "h-full transition-all duration-1000",
                                    user.planId === 'max' ? "bg-amber-500" : user.planId === 'pro' ? "bg-brand-500" : "bg-slate-400"
                                )}
                                style={{ width: `${Math.min(100, ((user.credits || 0) / 500) * 100)}%` }}
                             />
                        </div>
                    </div>
                )}

                <Link
                    href="/settings"
                    onClick={onClose}
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        pathname === "/settings" ? "bg-brand-50 text-brand-700 font-bold" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                >
                    <Settings className={cn("h-5 w-5 shrink-0", pathname === "/settings" ? "text-brand-600" : "text-slate-400")} />
                    {!actualCollapsed && <span>{t("nav.settings")}</span>}
                </Link>
                <Link
                    href="/settings/suggestions"
                    onClick={onClose}
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors transition-all duration-200",
                        pathname === "/settings/suggestions" ? "bg-brand-50 text-brand-700 font-bold border-l-4 border-brand-500 rounded-l-none pl-2" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                >
                    <MessageSquare className={cn("h-5 w-5 shrink-0", pathname === "/settings/suggestions" ? "text-brand-600" : "text-slate-400")} />
                    {!actualCollapsed && <span>{t("nav.suggestions")}</span>}
                </Link>
                <button 
                    onClick={() => {
                        triggerHaptic('medium');
                        logout();
                    }}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!actualCollapsed && <span>{t("nav.logout")}</span>}
                </button>
            </div>
        </aside>
    );
}

export function MobileNav({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();
    const { t } = useLanguage();

    const MOBILE_NAV = [
        { href: "/tools/chat", icon: MessageSquare, label: "Chat" },
        { href: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
        { href: "/tools", icon: Wrench, label: t("nav.tools") },
        { href: "/tools/docs", icon: FolderOpen, label: "Docs" },
        { href: "/links", icon: Link2, label: t("nav.links") },
        { href: "/leads", icon: Users, label: t("nav.leads") },
        { href: "/tools/captacao", icon: Camera, label: "Captação" },
        { href: "/credits", icon: Coins, label: "Créditos" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-slate-200/60 lg:hidden">
            <div className="flex items-center px-4 py-2 overflow-x-auto gap-4 w-full justify-start snap-x [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-brand-500 [&::-webkit-scrollbar-thumb]:rounded-full pb-2">
                {MOBILE_NAV.map((item, index) => {
                    const active = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-300 min-w-[64px] snap-center shrink-0 border relative",
                                active ? "text-brand-600 bg-brand-50 border-brand-500" : "text-slate-400 hover:text-slate-700 border-slate-200"
                            )}
                            onClick={() => {
                                triggerHaptic('light');
                                onClose?.();
                            }}
                        >
                            <div className="relative">
                                <item.icon className="h-5 w-5" />
                                <Sparkles className="absolute -top-1 -right-1 h-2 w-2 text-brand-500 animate-pulse" />
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
