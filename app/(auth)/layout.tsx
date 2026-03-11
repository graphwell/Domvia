import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Entrar",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-950 via-surface-900 to-surface-950 flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-brand-400/5 blur-3xl" />
            </div>
            <div className="relative w-full max-w-md">
                {children}

                {/* Auth Footer */}
                <div className="mt-8 text-center px-4">
                    <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest leading-loose">
                        Desenvolvido por Somar Soluções Digitais
                    </p>
                </div>
            </div>
        </div>
    );
}
