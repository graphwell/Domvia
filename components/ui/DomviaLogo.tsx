import { cn } from "@/lib/utils";

interface DomviaLogoProps {
    className?: string;
    variant?: "default" | "light" | "dark" | "icon-only";
    collapsed?: boolean;
}

export function DomviaLogo({ className, variant = "default", collapsed = false }: DomviaLogoProps) {
    // Cores dinâmicas para o texto baseadas no variant
    const textBaseColor = variant === "light" || variant === "dark"
        ? "text-white"
        : "text-slate-900";

    const isIconOnly = variant === "icon-only" || collapsed;

    return (
        <div className={cn("flex items-center gap-2.5 group select-none", className)}>
            {/* O "D" Spark - Símbolo Tech/House */}
            <svg
                width="38"
                height="38"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 transition-transform duration-300 group-hover:scale-105"
            >
                {/* Roof / House Outline */}
                <path
                    d="M3 20L20 4.5L37 20"
                    stroke="#1E3A8A" // Navy Blue
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M10 14V6H6V18.5"
                    stroke="#1E3A8A" // Navy Blue
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* The "D" Letterform inside the house shape */}
                <path
                    d="M12 30V15H18C23.5 15 28 19.5 28 25C28 30.5 23.5 35 18 35H12Z"
                    fill="#1E3A8A" // Navy Blue base
                />

                {/* Cutout to make it a D shape + digital feel */}
                <path
                    d="M16 20H18C20.8 20 23 22.2 23 25C23 27.8 20.8 30 18 30H16V20Z"
                    fill="white"
                />

                {/* Digital "Spark" (AI concept inside the D) */}
                <path
                    d="M20 25L23 21M24 25L27 22"
                    stroke="#06B6D4" // Vibrant Cyan
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <circle cx="20" cy="21" r="1.5" fill="#06B6D4" />
                <circle cx="25" cy="18" r="2" fill="#06B6D4" />
                <circle cx="27" cy="24" r="1.5" fill="#06B6D4" />
            </svg>

            {/* Texto "DOMVIA" Impactante (Sem Slogan) */}
            {!isIconOnly && (
                <span
                    className={cn(
                        "font-display text-[1.6rem] font-black tracking-[-0.03em] uppercase leading-none mt-1",
                        textBaseColor
                    )}
                >
                    dom
                    <span className="text-[#06B6D4]">via</span>
                </span>
            )}
        </div>
    );
}
