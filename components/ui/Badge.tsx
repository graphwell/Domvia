import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
    "inline-flex items-center gap-1 rounded-full text-xs font-semibold px-2.5 py-0.5 whitespace-nowrap",
    {
        variants: {
            variant: {
                default: "bg-slate-100 text-slate-700",
                brand: "bg-brand-100 text-brand-700",
                success: "bg-emerald-100 text-emerald-700",
                warning: "bg-amber-100 text-amber-700",
                danger: "bg-red-100 text-red-700",
                gold: "bg-gold-100 text-gold-700",
                outline: "border border-slate-300 text-slate-600 bg-transparent",
            },
        },
        defaultVariants: { variant: "default" },
    }
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
    dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
    return (
        <span className={cn(badgeVariants({ variant }), className)} {...props}>
            {dot && (
                <span
                    className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        variant === "success" && "bg-emerald-500",
                        variant === "warning" && "bg-amber-500",
                        variant === "danger" && "bg-red-500",
                        variant === "brand" && "bg-brand-500",
                        (!variant || variant === "default") && "bg-slate-500",
                    )}
                />
            )}
            {children}
        </span>
    );
}

// ── Status-specific convenience badges ───────
const STATUS_MAP = {
    active: { label: "Ativo", variant: "success" as const },
    sold: { label: "Vendido", variant: "default" as const },
    paused: { label: "Pausado", variant: "warning" as const },
    new: { label: "Novo", variant: "brand" as const },
    contacted: { label: "Contatado", variant: "warning" as const },
    qualified: { label: "Qualificado", variant: "success" as const },
    converted: { label: "Convertido", variant: "gold" as const },
    lost: { label: "Perdido", variant: "danger" as const },
};

export function StatusBadge({ status }: { status: string }) {
    const map = STATUS_MAP[status as keyof typeof STATUS_MAP];
    if (!map) return <Badge>{status}</Badge>;
    return <Badge variant={map.variant} dot>{map.label}</Badge>;
}
