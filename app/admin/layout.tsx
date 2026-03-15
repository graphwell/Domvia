"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard, Users, CreditCard,
    LogOut, Menu, X,
    Activity, Bot, UserCheck, ChevronRight, MessageSquare, Coins
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { useRouter } from "next/navigation";
import { NotificationProvider } from "@/context/NotificationContext";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const NAV_ITEMS = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Usuários", href: "/admin/users", icon: Users },
    { name: "Leads Globais", href: "/admin/leads", icon: UserCheck },
    { name: "Gestão de IA", href: "/admin/ai", icon: Bot },
    { name: "Custo de Créditos", href: "/admin/settings/credits", icon: Coins },
    { name: "Planos & Preços", href: "/admin/plans", icon: CreditCard },
    { name: "Métricas Globais", href: "/admin/metrics", icon: Activity },
    { name: "Sugestões", href: "/admin/suggestions", icon: MessageSquare },
    { name: "Inteligência", href: "/admin/engagement", icon: Bot },
];

// ── Breadcrumb helper ─────────────────────────────────────────────
const ROUTE_LABELS: Record<string, string> = {
    "/admin/dashboard": "Dashboard",
    "/admin/users": "Usuários",
    "/admin/leads": "Leads Globais",
    "/admin/ai": "Gestão de IA",
    "/admin/settings/credits": "Custo de Créditos",
    "/admin/plans": "Planos & Preços",
    "/admin/metrics": "Métricas Globais",
    "/admin/suggestions": "Sugestões",
    "/admin/engagement": "Inteligência",
};

function Breadcrumb({ pathname }: { pathname: string }) {
    const label = ROUTE_LABELS[pathname];
    if (!label) return null;
    return (
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
            <span className="font-semibold text-slate-500">Admin</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-indigo-600">{label}</span>
        </nav>
    );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!user || !user.role.startsWith("ADMIN"))) {
            router.replace("/login");
        }
    }, [user, isLoading, router]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (isLoading || !user || !user.role.startsWith("ADMIN")) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    <p className="text-slate-400 text-sm">Verificando permissões...</p>
                </div>
            </div>
        );
    }

    const initials = user.name
        ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
        : user.email?.slice(0, 2).toUpperCase() ?? "AD";

    const roleLabel = user.role === "ADMIN_MASTER" ? "Admin Master" : "Admin";

    return (
        <NotificationProvider>
            <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-slate-900 text-white z-50 sticky top-0">
                    <div className="flex items-center gap-2">
                        <div className="relative h-8 w-32">
                            <Image
                                src="/logo-domvia.png?v=202603092040"
                                alt="Domvia"
                                fill
                                unoptimized
                                className="object-contain object-left"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </header>

                {/* Mobile overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed lg:sticky top-0 left-0 z-40 w-64 h-screen bg-slate-900 transition-transform duration-300 transform
                    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    flex flex-col border-r border-slate-800
                `}>
                    {/* Logo */}
                    <div className="p-6 hidden lg:flex items-center gap-2.5 border-b border-slate-800">
                        <div className="relative h-10 w-40">
                            <Image
                                src="/logo-domvia.png?v=202603092040"
                                alt="Domvia"
                                fill
                                unoptimized
                                className="object-contain object-left"
                            />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-3 mb-3">Menu</p>
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                                        ${isActive
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                        }
                                    `}
                                >
                                    <item.icon className={`h-4 w-4 ${isActive ? "text-indigo-200" : "text-slate-500"}`} />
                                    {item.name}
                                    {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-300" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Admin Profile Card */}
                    <div className="p-3 border-t border-slate-800">
                        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/60 mb-2">
                            {/* Avatar */}
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user.name ?? "Admin"}</p>
                                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                            </div>
                            <span className="text-[9px] font-black text-indigo-300 bg-indigo-600/30 px-1.5 py-0.5 rounded-full uppercase tracking-widest shrink-0">
                                {roleLabel}
                            </span>
                        </div>
                        <Link
                            href="/dashboard"
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-indigo-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-bold rounded-xl mb-1"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Voltar ao Portal
                        </Link>
                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium rounded-xl"
                        >
                            <LogOut className="h-4 w-4" />
                            Sair do Admin
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-10 min-w-0">
                    <div className="max-w-7xl mx-auto">
                        <Breadcrumb pathname={pathname} />
                        {children}
                    </div>
                </main>
            </div>
        </NotificationProvider>
    );
}
