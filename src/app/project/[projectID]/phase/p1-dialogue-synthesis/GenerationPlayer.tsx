"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Generation {
    id: string;
    audioUrl: string;
    duration: number;
}

export default function GenerationPlayer({
    generation,
    generationNumber,
    isSelected,
    isGenerating,
    onSelect,
}: {
    generation: Generation;
    generationNumber: number;
    isSelected: boolean;
    isGenerating: boolean;
    onSelect: () => void;
}) {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div
            className={cn(
                "flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors",
                isSelected ? "border-emerald-500 bg-emerald-500/10" : "border-border bg-muted/30",
            )}
        >
            <span className="text-[10px] text-muted-foreground w-5">#{generationNumber}</span>

            {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-full bg-primary hover:bg-primary/90"
                    onClick={() => setIsPlaying(!isPlaying)}
                >
                    {isPlaying ? (
                        <Pause className="h-3.5 w-3.5 text-primary-foreground" />
                    ) : (
                        <Play className="h-3.5 w-3.5 text-primary-foreground" />
                    )}
                </Button>
            )}

            {/* waveform placeholder — will be replaced with peaks.js */}
            <div className="flex-1 h-8 min-w-32" />

            <Button
                size="icon"
                variant={isSelected ? "default" : "outline"}
                onClick={onSelect}
                className={cn("h-6 w-6 p-0", isSelected && "bg-emerald-600 hover:bg-emerald-700 border-emerald-600")}
            >
                <Check className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}
