import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VoiceResponse } from "@/ext/elevenLabsAPI/voices/listVoices/response";
import { cn } from "@/lib/utils";
import { Copy, History, Link2, MoreHorizontal, Pause, Play } from "lucide-react";

export function VoiceItem({
    voice,
    isPlaying,
    isSelected,
    onPlayToggle,
    onSelect,
}: {
    voice: VoiceResponse;
    isPlaying: boolean;
    isSelected: boolean;
    onPlayToggle: () => void;
    onSelect: () => void;
}) {
    const { category, name, description } = voice;

    return (
        <div
            onClick={onSelect}
            className={cn(
                "group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 transition-colors",
                isSelected ? "bg-muted" : "hover:bg-muted/50",
            )}
        >
            {/* Avatar - pinwheel style like the reference */}
            <div className="relative shrink-0">
                <div
                    className="size-10 rounded-full"
                    style={{
                        background: `conic-gradient(from 0deg, red 0deg, blue 120deg, green 240deg, orange 360deg)`,
                    }}
                />
                {/* Professional star badge */}
                {category === "PROFESSIONAL" && (
                    <div className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-amber-400 shadow-sm">
                        <svg className="size-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{description}</p>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-0.5">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlayToggle();
                    }}
                >
                    {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 translate-x-0.5" />}
                    <span className="sr-only">{isPlaying ? "Pause" : "Play"} voice</span>
                </Button>
                <VoiceItemDropdownMenu />
            </div>
        </div>
    );
}

function VoiceItemDropdownMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">More options</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem className="gap-2">
                    <Link2 className="size-4" />
                    Copy voice link
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                    <Copy className="size-4" />
                    Copy voice ID
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                    <History className="size-4" />
                    View history
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
