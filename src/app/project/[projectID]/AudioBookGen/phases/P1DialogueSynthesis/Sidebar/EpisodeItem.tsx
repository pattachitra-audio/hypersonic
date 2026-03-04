import { AudioBook } from "@/schemas/AudioBook";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import StatusDot from "./StatusDot";
import { SceneItem } from "./SceneItem";

export default function EpisodeItem({ audioBook, index }: { audioBook: AudioBook; index: number }) {
    const [open, setOpen] = useState<boolean>(index === 0);

    const episode = audioBook.episodes[index];
    const numScenes = episode.sceneEnd - episode.sceneBegin;
    // const scenesDone = episode.scenes.filter((s) => s.status === "complete").length;

    return (
        <li className="mb-1">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-lg hover:bg-white/4 transition-colors text-left"
            >
                <span
                    className="text-zinc-500 transition-transform"
                    style={{ transform: open ? "rotate(0)" : "rotate(-90deg)" }}
                >
                    <ChevronDown size={14} />
                </span>
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-violet-500/10 text-violet-400 text-[11px] font-bold shrink-0">
                    {index + 1}
                </span>
                <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-semibold text-zinc-200 truncate">{episode.name}</span>
                    <span className="flex items-center gap-2.5 mt-0.5">
                        <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                            {/*<Clock size={9} /> */}
                            {/*episode.duration*/}
                        </span>
                        <span className="text-[10px] text-zinc-600">
                            {`$scenesDone`}/{`$episode.scenes.length`} scenes
                        </span>
                        <StatusDot />
                    </span>
                </span>
            </button>

            {open && (
                <ul className="ml-3 mt-0.5 space-y-0.5">
                    {Array.from({ length: numScenes }).map((_, index) => (
                        <SceneItem key={index} index={index + episode.sceneBegin} {...{ audioBook }} />
                    ))}
                    {/*episode.scenes.map((scene) => (
                        <SceneItem key={scene.id} scene={scene} />
                    ))*/}
                </ul>
            )}
        </li>
    );
}
