import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({ className, rounded = "md", ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse bg-slate-200",
                rounded === "sm" && "rounded",
                rounded === "md" && "rounded-xl",
                rounded === "lg" && "rounded-2xl",
                rounded === "full" && "rounded-full",
                className
            )}
            {...props}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-32 w-full" />
        </div>
    );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
    return (
        <tr className="border-b border-slate-100">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}
