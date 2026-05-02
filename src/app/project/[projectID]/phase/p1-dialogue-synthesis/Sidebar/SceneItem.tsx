import { ChevronDown, Film } from "lucide-react";
// import { Scene } from "@/schemas/Scene";
import { useState } from "react";
import StatusDot from "./StatusDot";
import DialogueItem from "./DialogueItem";
import { scrollToScene } from "../scrollUtils";
import { AudioBookTypeForDialogueSynthesisPhase } from "@/hooks/useAudioBookForDialogueSynthesisPhase";

export function SceneItem({ audioBook, index }: { audioBook: AudioBookTypeForDialogueSynthesisPhase; index: number }) {
    const [open, setOpen] = useState<boolean>(false);

    const scene = audioBook.scenes[index];
    const synthCount = 0;
    const numDialogues = scene.dialogueEnd - scene.dialogueBegin;

    // const synthCount = scene.dialogues.filter((d) => d.status === "synthesized").length;
    // const synthCount = scene.dialogueEnd - scene.dialogueBegin;
    // const total = scene.dialogues.length;

    return (
        <li className="ml-2 border-l border-sidebar-border">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-2.5 py-2 px-3 rounded-md hover:bg-sidebar-accent transition-colors text-left group"
            >
                <span
                    className="text-muted-foreground transition-transform"
                    style={{ transform: open ? "rotate(0)" : "rotate(-90deg)" }}
                >
                    <ChevronDown size={13} />
                </span>
                <Film size={13} className="text-sidebar-primary shrink-0" />
                <span className="flex-1 min-w-0">
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            scrollToScene(index);
                        }}
                        className="block text-[13px] font-medium text-sidebar-foreground truncate hover:underline cursor-pointer"
                    >
                        {scene.name}
                    </span>
                    <span className="flex items-center gap-2.5 mt-0.5">
                        {/*<span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock size={9} />
                            {scene.duration}
                        </span> */}
                        <span className="text-[10px] text-muted-foreground">
                            {synthCount}/{numDialogues} lines
                        </span>
                        <StatusDot />
                    </span>
                </span>
            </button>

            {open && (
                <ul className="ml-5 pb-1">
                    {Array.from({ length: numDialogues }).map((_, index) => (
                        <DialogueItem key={index} {...{ audioBook }} index={index + scene.dialogueBegin} />
                    ))}
                </ul>
            )}
        </li>
    );
}
