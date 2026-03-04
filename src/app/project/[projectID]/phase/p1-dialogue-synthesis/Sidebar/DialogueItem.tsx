import { MessageSquare, Play } from "lucide-react";
import StatusDot from "./StatusDot";
import { AudioBook } from "@/schemas/AudioBook";

export default function DialogueItem({ audioBook, index }: { audioBook: AudioBook; index: number }) {
    const dialogue = audioBook.dialogues[index];
    const character = audioBook.characters[dialogue.character];
    // const synthesized = false;
    // const status = "SYNTHESIZED";
    const status = "";

    return (
        <div className="group flex items-start gap-2.5 py-2 px-3 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer">
            <div className="mt-0.5 shrink-0">
                <MessageSquare size={13} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-semibold tracking-wide text-sidebar-foreground uppercase">
                        {character.name}
                    </span>
                    <StatusDot />
                </div>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed truncate italic">{dialogue.text}</p>
                <div className="flex items-center gap-2 mt-1">
                    {/*<span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Mic size={9} />
                        {character.name}
                    </span>*/}
                    {status === "SYNTHESIZED" && (
                        <button className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] text-emerald-500 hover:text-emerald-400 transition-all">
                            <Play size={9} />
                            Preview
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
