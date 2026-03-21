// --- Status badge ---
type StatusBadgeType = "COMPLETE" | "SYNTHESIZED" | "IN_PROGRESS" | "PENDING";

export default function StatusDot({ status }: { status?: StatusBadgeType }) {
    status = status ?? "PENDING";

    const colors: Record<StatusBadgeType, string> = {
        COMPLETE: "bg-emerald-400",
        SYNTHESIZED: "bg-emerald-400",
        IN_PROGRESS: "bg-amber-400 animate-pulse",
        PENDING: "bg-muted-foreground",
    };

    return <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors[status] || colors.PENDING}`} />;
}
