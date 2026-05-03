import { Clock, MapPin } from "lucide-react";
import Dialogue from "./Dialogue";
import { useReducer } from "react";
import type { AudioBookTypeForDialogueSynthesisPhase } from "@/hooks/useAudioBookForDialogueSynthesisPhase";

export default function Scene({
    audioBook,
    index,
}: {
    audioBook: AudioBookTypeForDialogueSynthesisPhase;
    index: number;
}) {
    const scene = audioBook.scenes[index];
    const dialogues = audioBook.dialogues.slice(scene.dialogueBegin, scene.dialogueEnd);
    // const [numDialoguesSelected, setNumDialoguesSelected] = useState(0);
    const [numDialoguesSelected, dispatchActionForNumDialoguesSelected] = useReducer(function reducer(
        state: number,
        action: "INCREMENT" | "DECREMENT",
    ) {
        switch (action) {
            case "INCREMENT":
                return state + 1;

            case "DECREMENT":
                return state - 1;
        }
    }, 0);

    // const sceneDialogues = dialogues.slice(scene.dialogueBegin, scene.dialogueEnd);
    // const selectedCount = sceneDialogues.filter((d) => !!selectedGenerations[d.id]).length;

    return (
        <section id={`scene-${index}`}>
            {/* Scene header — sticky below config bar */}
            <div
                data-scene-header
                className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-8 py-3"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-0.5">
                            Scene {index + 1}
                        </p>
                        <h2 className="text-base font-semibold text-foreground">{scene.name}</h2>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            {scene.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={10} />
                                    {scene.location}
                                </span>
                            )}
                            {scene.time && (
                                <span className="flex items-center gap-1">
                                    <Clock size={10} />
                                    {scene.time}
                                </span>
                            )}
                        </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 tabular-nums">
                        {numDialoguesSelected} / {dialogues.length} selected
                    </span>
                </div>
            </div>

            {/* Dialogues */}
            <div className="px-8">
                {dialogues.map((_, i) => (
                    <Dialogue
                        key={i}
                        {...{ audioBook }}
                        index={scene.dialogueBegin + i}

                        // key={dialogue.id}
                        // dialogue={dialogue}
                        // character={audioBook.characters[dialogue.characterIndex]}
                        // selectedGenerationId={selectedGenerations[dialogue.id]}
                        // isFirst={dialogue.dialogueIndex === 0}
                        // isLast={dialogue.dialogueIndex === dialogues.length - 1}
                        // onRegenerate={handleRegenerate}
                        // onSelectGeneration={handleSelectGeneration}
                        // onVariantChange={handleVariantChange}
                        // onTextChange={handleTextChange}
                        // onMoveUp={handleMoveUp}
                        // onMoveDown={handleMoveDown}
                    />
                ))}
            </div>
        </section>
    );
}
