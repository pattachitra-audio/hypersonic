// --- Progress bar ---
export function ProgressBar({ value, max }: { value: number; max: number }) {
    const pct = Math.round((value / max) * 100);
    return (
        <div className="w-full">
            <div className="flex justify-between text-[10px] text-zinc-500 mb-1.5">
                <span>Synthesis Progress</span>
                <span className="text-zinc-400 font-medium">{pct}%</span>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                    }}
                />
            </div>
        </div>
    );
}
