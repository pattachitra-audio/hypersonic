"use client";

import { useState, useReducer, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RotateCcw, Edit2, Check, X, MoreVertical, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import type { AudioPlayerAdapterResourceStateType } from "@/components/MiniAudioPlayer/MiniAudioPlayer";
import { AudioBook } from "@/schemas/AudioBook";
import { INVALID_INDEX } from "@/constants";
import { PeaksAudioPlayerAdapter } from "@/utils/audio/PeaksAudioPlayerAdapter";
import { produce } from "immer";
import dynamic from "next/dynamic";

const MiniAudioPlayer = dynamic(() => import("@/components/MiniAudioPlayer"), { ssr: false });

type GenerationSettingsType = {
    numVariants: number;
};

type DialogueStateType = "INIT" | "GENERATING" | "GENERATED" | "REGENERATING" | "REGENERATED" | "SELECTED";

const VARIANT_OPTIONS = [1, 2, 4, 6, 8];
export default function Dialogue({
    audioBook,
    index,
    // dialogue,
    // character,
    // selectedGenerationId,
    //isFirst,
    // isLast,
    // onRegenerate,
    // onSelectGeneration,
    // onVariantChange,
    // onTextChange,
    // onMoveUp,
    // onMoveDown,
}: {
    audioBook: AudioBook;
    index: number;
    // dialogue: DialogueGeneration;
    // character: Character;
    // selectedGenerationId?: string;
    // isFirst: boolean;
    // isLast: boolean;
    // onRegenerate: (id: string) => void;
    // onSelectGeneration: (dialogueId: string, generationId: string) => void;
    // onVariantChange: (id: string, n: number) => void;
    // onTextChange: (id: string, text: string) => void;
    // onMoveUp: (id: string) => void;
    // onMoveDown: (id: string) => void;
}) {
    const dialogue = audioBook.dialogues[index];
    const character = audioBook.characters[dialogue.character];
    const [selectedGenerationIndex, setSelectedGenerationIndex] = useState(INVALID_INDEX);
    const [generations, setGenerations] = useState(new Array<AudioPlayerAdapterResourceStateType>(0));
    const [settings, setSettings] = useState<GenerationSettingsType>({
        numVariants: 2,
    });

    const [dialogueState, setDialogueState] = useState<DialogueStateType>("INIT");

    const updateSetting = useCallback(
        <Key extends keyof GenerationSettingsType, Value extends GenerationSettingsType[Key]>(
            key: Key,
            value: Value,
        ) => {
            setSettings((settings) => ({
                ...settings,
                [key]: value,
            }));
        },
        [setSettings],
    );

    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(dialogue.text);
    // const [dialogueState, setDialogueState] = useStat
    // const [generating, setGenerating] = useState(false);
    // const [generatingCount, ]
    const [genCount, dispatchActionForGenCount] = useReducer(function reducer(
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

    /* useEffect(() => {
        if (!isEditing) setEditedText(dialogue.text);
    }, [dialogue.text, isEditing]); */

    // const isGenerating = dialogue.state === "GENERATING";

    /* function handleSave() {
        onTextChange(dialogue.id, editedText);
        setIsEditing(false);
    } */

    const generating = genCount !== 0;
    function generate() {
        const text = dialogue.text;

        const generateOne = async (index: number) => {
            dispatchActionForGenCount("INCREMENT");
            setGenerations((value) =>
                produce(value, (draft) => {
                    draft[index] = { status: "PENDING" };
                }),
            );

            // const url = `https://samplelib.com/lib/preview/mp3/sample-${values[randomIndex]}s.mp3`;
            const url = `https://upload.wikimedia.org/wikipedia/commons/a/a9/Tromboon-sample.ogg`;
            let response: Response;

            try {
                response = await fetch(url);
            } catch (thrownError) {
                let error: Error = new Error(`Failed to fetch '${url}'`);

                if (thrownError instanceof Error) {
                    error = thrownError;
                }

                setGenerations((value) =>
                    produce(value, (draft) => {
                        draft[index] = { status: "ERROR", error };
                    }),
                );
                dispatchActionForGenCount("DECREMENT");
                return;
            }

            if (response.status !== 200) {
                setGenerations((value) =>
                    produce(value, (draft) => {
                        draft[index] = { status: "ERROR", error: new Error(`Response status: ${response.status}`) };
                    }),
                );
                dispatchActionForGenCount("DECREMENT");
                return;
            }

            const contentType = response.headers.get("content-type");

            if (contentType === null) {
                setGenerations((value) =>
                    produce(value, (draft) => {
                        draft[index] = { status: "ERROR", error: new Error(`'Content-Type' header not present`) };
                    }),
                );
                dispatchActionForGenCount("DECREMENT");
                return;
            }

            if (contentType !== "audio/mpeg" && contentType !== "audio/wav" && contentType !== "application/ogg") {
                setGenerations((value) =>
                    produce(value, (draft) => {
                        draft[index] = { status: "ERROR", error: new Error(`'Content-Type': ${contentType}`) };
                    }),
                );
                dispatchActionForGenCount("DECREMENT");
                return;
            }

            const arrayBuffer = await response.arrayBuffer();
            console.log("arrayBuffer:", arrayBuffer);
            const audioPlayer = await PeaksAudioPlayerAdapter.fromArrayBuffer(arrayBuffer);

            setGenerations((value) =>
                produce(value, (draft) => {
                    draft[index] = { status: "SUCCESS", data: audioPlayer };
                }),
            );
            dispatchActionForGenCount("DECREMENT");
        };

        setGenerations(Array.from({ length: settings.numVariants }));

        for (let i = 0; i < settings.numVariants; i++) {
            generateOne(i);
        }
    }

    function handleCancel() {
        setEditedText(dialogue.text);
        setIsEditing(false);
    }

    function handleSave() {}

    return (
        <article className="group py-4 border-b border-border/50 last:border-0">
            {/* Speaker + controls */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {genCount !== 0 && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                    <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
                        {character.name}
                    </span>
                    {/*{dialogue.state === "INITIAL" && (
                        <span className="text-[10px] text-muted-foreground">· not generated</span>
                    )}
                    {dialogue.state === "GENERATED" && selectedGenerationId && (
                        <span className="text-[10px] text-emerald-600">· selected</span>
                    )}
                    {dialogue.state === "GENERATED" && !selectedGenerationId && (
                        <span className="text-[10px] text-amber-600">· pick a variant</span>
                    )} */}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                        <>
                            <Button variant="ghost" size="sm" onClick={handleCancel} className="h-7 gap-1 text-xs">
                                <X className="h-3.5 w-3.5" /> Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave} className="h-7 gap-1 text-xs">
                                <Check className="h-3.5 w-3.5" /> Save
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                                className="h-7 gap-1 text-xs"
                            >
                                <Edit2 className="h-3.5 w-3.5" /> Edit
                            </Button>

                            {/* Variant count */}
                            <div className="flex gap-0.5 border border-border rounded-md p-0.5">
                                {VARIANT_OPTIONS.map((option, index) => (
                                    <Button
                                        key={index}
                                        variant={settings.numVariants === option ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => updateSetting("numVariants", option)}
                                        className="h-6 w-6 p-0 text-[10px]"
                                    >
                                        {option}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={generate}
                                disabled={generating}
                                className="h-7 gap-1 text-xs"
                            >
                                <RotateCcw className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`} />
                                {dialogueState === "INIT" ? "Generate" : "Re-generate"}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                        <MoreVertical className="h-3.5 w-3.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        disabled={index === 0}
                                        onClick={() => {} /* onMoveUp(dialogue.id) */}
                                    >
                                        <ArrowUp className="mr-2 h-4 w-4" /> Move Up
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        disabled={index === audioBook.dialogues.length - 1}
                                        onClick={() => {} /* onMoveDown(dialogue.id) */}
                                    >
                                        <ArrowDown className="mr-2 h-4 w-4" /> Move Down
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </div>
            </div>

            {/* Text */}
            {isEditing ? (
                <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="text-sm resize-none min-h-20 mb-3"
                    autoFocus
                />
            ) : (
                <p className="text-sm text-foreground leading-relaxed mb-3">{dialogue.text}</p>
            )}

            {/* Generation variants */}
            {
                <ul className="flex flex-wrap gap-2 mt-3">
                    {generations.map((generation, index) => (
                        <Generation key={index} {...{ generation, index, audioBook }} onSelect={() => {}} />
                    ))}
                </ul>
            }
        </article>
    );
}

{
    /*<GenerationPlayer
                            key={gen.id}
                            generation={gen}
                            generationNumber={idx + 1}
                            isSelected={selectedGenerationId === gen.id}
                            isGenerating={isGenerating}
                            onSelect={() => onSelectGeneration(dialogue.id, gen.id)}
                        /> */
}

function numDigits(n: number) {
    let ans = 0;

    while (n) {
        n = Math.trunc(n / 10);
        ans++;
    }

    return ans;
}

function padIndex(index: number, maxIndex: number) {
    const width = numDigits(maxIndex);

    let str = index.toString();
    str += "0".repeat(width - str.length);

    return str;
}

function formatCharacterName(name: string) {
    name = name.toLowerCase();
    name = name.replaceAll(" ", "-");

    return name;
}

function Generation({
    index,
    audioBook,
    generation,
    onSelect,
}: {
    index: number;
    audioBook: AudioBook;
    onSelect: () => void;
    generation: AudioPlayerAdapterResourceStateType;
}) {
    const character = audioBook.characters[audioBook.dialogues[index].character];
    const voiceID = character.voice?.voiceID;

    const downloadFileNameWithoutExtension = `${padIndex(index, audioBook.dialogues.length - 1)}_${formatCharacterName(character.name)}_${voiceID ?? "undefined-voice-id"}`;

    return (
        <MiniAudioPlayer key={index} audioPlayerResourceState={generation} {...{ downloadFileNameWithoutExtension }} />
    );
}
