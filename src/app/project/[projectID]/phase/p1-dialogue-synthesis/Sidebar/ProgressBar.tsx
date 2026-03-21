// --- Progress bar ---
export function ProgressBar({ value, max }: { value: number; max: number }) {
    const pct = Math.round((value / max) * 100);
    return (
        <div className="w-full">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                <span>Synthesis Progress</span>
                <span className="text-sidebar-foreground font-medium">{pct}%</span>
            </div>
            <div className="h-1 bg-sidebar-accent rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700 bg-sidebar-primary"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
