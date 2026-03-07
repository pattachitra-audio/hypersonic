import { AudioBook } from "@/schemas/AudioBook";
import { BookOpen, Film, User, Volume2 } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import EpisodeItem from "./EpisodeItem";
import { useSidebarStore } from "@/hooks/useSidebarStore";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function Sidebar({ audioBook }: { audioBook: AudioBook }) {
    const open = useSidebarStore((state) => state.sidebarLeftOpen);
    // Compute totals
    // const allDialogues = book.episodes.flatMap((ep) => ep.scenes.flatMap((sc) => sc.dialogues));
    // const synthesized = allDialogues.filter((d) => d.status === "synthesized").length;
    // const totalScenes = book.episodes.reduce((sum, ep) => sum + ep.scenes.length, 0);
    // const uniqueVoices = [...new Set(allDialogues.map((d) => d.voice))].length;

    // TODO: Add better CSS for sidebar show/hide toggle animation, where the sidebar color also changes to black
    return (
        <div className={cn("h-screen transition-all duration-200 ease-in-out overflow-hidden", open ? "w-80" : "w-0")}>
            <aside className="w-80 h-screen flex flex-col overflow-hidden bg-sidebar border-r border-sidebar-border">
                <Header {...{ audioBook }} />
                {/*<div className="mx-4 h-px bg-sidebar-border" /> */}
                <Separator />
                <Tree {...{ audioBook }} />

                {/* Footer */}
                {/*<div className="px-4 py-3 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 text-[10.5px] text-zinc-600">
                    <Clock size={10} />
                    <span>Total: {book.totalDuration}</span>
                    <span className="ml-auto text-zinc-700">{allDialogues.length} lines</span>
                </div>
            </div> */}
                <Separator />
                <Footer {...{ audioBook }} />
            </aside>
        </div>
    );
}

function Header({ audioBook }: { audioBook: AudioBook }) {
    return (
        <header className="px-4 pt-5 pb-4">
            <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-sidebar-primary">
                    <Volume2 size={16} className="text-sidebar-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-[15px] font-bold text-sidebar-foreground leading-tight">{audioBook.name}</h1>
                    {/*<p className="text-[11px] text-muted-foreground">{book.author}</p> */}
                </div>
            </div>

            {/* Stats strip */}
            <div className="flex items-center gap-3 mb-4 text-[10.5px] text-muted-foreground">
                <span className="flex items-center gap-1">
                    <BookOpen size={10} />
                    {audioBook.episodes.length} episodes
                </span>
                <span className="text-sidebar-border">·</span>
                <span className="flex items-center gap-1">
                    <Film size={10} />
                    {audioBook.scenes.length} scenes
                </span>
                <span className="text-sidebar-border">·</span>
                <span className="flex items-center gap-1">
                    <User size={10} />
                    {audioBook.characters.length} characters
                </span>
            </div>
        </header>
    );
}

function Tree({ audioBook }: { audioBook: AudioBook }) {
    return (
        <ul className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 pretty-scrollbar">
            {audioBook.episodes.map((_, index) => (
                <EpisodeItem key={index} {...{ index, audioBook }} />
            ))}
        </ul>
    );
}

function Footer({ audioBook }: { audioBook: AudioBook }) {
    return (
        <footer>
            <ProgressBar value={10} max={20} />;
        </footer>
    );
}
