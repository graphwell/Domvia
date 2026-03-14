"use client";

import { AppSidebar, MobileNav } from "@/components/layout/AppSidebar";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { DomviaLogo } from "@/components/layout/Header";
import { Bell, Search, Menu, X, UserPlus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { FloatingIntelligentButton } from "@/components/dashboard/FloatingIntelligentButton";
import { FeedbackPrompt } from "@/components/dashboard/FeedbackPrompt";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/auth-provider";
import { NotificationProvider } from "@/context/NotificationContext";

import { CreditCounter } from "@/components/dashboard/CreditCounter";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <NotificationProvider>
            <div className={cn(
                "flex min-h-screen bg-surface-50",
                user?.planId === 'pro' ? 'theme-pro' : user?.planId === 'elite' ? 'theme-elite' : ''
            )}>
                {/* Sidebar - Desktop */}
                <AppSidebar />

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Topbar */}
                    <header className="sticky top-0 z-40 glass border-b border-slate-200/60">
                        <div className="flex items-center h-16 px-4 sm:px-6 gap-2 sm:gap-4">
                            {/* Mobile hamburger & logo */}
                            <div className="flex lg:hidden items-center gap-3">
                                <button 
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    <Menu className="h-6 w-6" />
                                </button>
                                <DomviaLogo />
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
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 hover:bg-brand-100 transition-all shadow-sm active:scale-95"
                                        style={{ animation: 'pulse-invite 2s ease-in-out infinite' }}
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-tight hidden sm:inline">Convide</span>
                                    </Link>
                                )}

                                {/* Notification bell */}
                                <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
                                    <Bell className="h-5 w-5" />
                                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brand-600" />
                                </button>

                                {/* Avatar */}
                                <UserAvatar />
                            </div>
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 overflow-x-hidden w-full max-w-full">
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

                {/* Mobile bottom nav */}
                <MobileNav />
                {/* Mobile Sidebar Drawer Overlay */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity animate-in fade-in duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <div 
                            className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300"
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
