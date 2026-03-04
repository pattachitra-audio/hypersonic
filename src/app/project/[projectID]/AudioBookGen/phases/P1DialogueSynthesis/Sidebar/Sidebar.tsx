import { AudioBook } from "@/schemas/AudioBook";
import { BookOpen, Film, User, Volume2 } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import EpisodeItem from "./EpisodeItem";

export default function Sidebar({ audioBook }: { audioBook: AudioBook }) {
    // Compute totals
    // const allDialogues = book.episodes.flatMap((ep) => ep.scenes.flatMap((sc) => sc.dialogues));
    // const synthesized = allDialogues.filter((d) => d.status === "synthesized").length;
    // const totalScenes = book.episodes.reduce((sum, ep) => sum + ep.scenes.length, 0);
    // const uniqueVoices = [...new Set(allDialogues.map((d) => d.voice))].length;

    return (
        <div
            className="w-80 h-screen flex flex-col overflow-hidden"
            style={{
                background: "linear-gradient(180deg, #0f0f17 0%, #0a0a12 100%)",
                fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
                borderRight: "1px solid rgba(255,255,255,0.04)",
            }}
        >
            {/* Header */}
            <div className="px-4 pt-5 pb-4">
                <div className="flex items-center gap-2.5 mb-4">
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)" }}
                    >
                        <Volume2 size={16} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-[15px] font-bold text-zinc-100 leading-tight">{audioBook.name}</h1>
                        {/*<p className="text-[11px] text-zinc-500">{book.author}</p> */}
                    </div>
                </div>

                {/* Stats strip */}
                <div className="flex items-center gap-3 mb-4 text-[10.5px] text-zinc-500">
                    <span className="flex items-center gap-1">
                        <BookOpen size={10} className="text-zinc-600" />
                        {audioBook.episodes.length} episodes
                    </span>
                    <span className="text-zinc-800">·</span>
                    <span className="flex items-center gap-1">
                        <Film size={10} className="text-zinc-600" />
                        {audioBook.scenes.length} scenes
                    </span>
                    <span className="text-zinc-800">·</span>
                    <span className="flex items-center gap-1">
                        <User size={10} className="text-zinc-600" />
                        {audioBook.characters.length} characters
                    </span>
                </div>

                <ProgressBar value={10} max={20} />
            </div>

            {/* Divider */}
            <div className="mx-4 h-px bg-zinc-800/60" />

            {/* Tree */}
            <ul
                className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#27272a transparent" }}
            >
                {audioBook.episodes.map((_, index) => (
                    <EpisodeItem key={index} {...{ index, audioBook }} />
                ))}
            </ul>

            {/* Footer */}
            {/*<div className="px-4 py-3 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 text-[10.5px] text-zinc-600">
                    <Clock size={10} />
                    <span>Total: {book.totalDuration}</span>
                    <span className="ml-auto text-zinc-700">{allDialogues.length} lines</span>
                </div>
            </div> */}
        </div>
    );
}

// --- Dialogue row ---
// --- Scene collapsible ---
// --- Episode collapsible ---

// --- Main Sidebar ---
// export default function AudiobookSidebar(): React.JSX.Element {}
