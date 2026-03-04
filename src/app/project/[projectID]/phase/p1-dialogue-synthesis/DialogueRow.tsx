"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RotateCcw, Edit2, Check, X, MoreVertical, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { Character } from "@/schemas/Character";
import GenerationPlayer from "./GenerationPlayer";
import { DialogueGeneration } from "./MainContent";

const VARIANT_OPTIONS = [1, 2, 4, 6, 8];

export default function DialogueRow({
    dialogue,
    character,
    selectedGenerationId,
    isFirst,
    isLast,
    onRegenerate,
    onSelectGeneration,
    onVariantChange,
    onTextChange,
    onMoveUp,
    onMoveDown,
}: {
    dialogue: DialogueGeneration;
    character: Character;
    selectedGenerationId?: string;
    isFirst: boolean;
    isLast: boolean;
    onRegenerate: (id: string) => void;
    onSelectGeneration: (dialogueId: string, generationId: string) => void;
    onVariantChange: (id: string, n: number) => void;
    onTextChange: (id: string, text: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(dialogue.text);

    useEffect(() => {
        if (!isEditing) setEditedText(dialogue.text);
    }, [dialogue.text, isEditing]);

    const isGenerating = dialogue.state === "GENERATING";

    function handleSave() {
        onTextChange(dialogue.id, editedText);
        setIsEditing(false);
    }

    function handleCancel() {
        setEditedText(dialogue.text);
        setIsEditing(false);
    }

    return (
        <article className="group py-4 border-b border-border/50 last:border-0">
            {/* Speaker + controls */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {isGenerating && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                    <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
                        {character.name}
                    </span>
                    {dialogue.state === "INITIAL" && (
                        <span className="text-[10px] text-muted-foreground">· not generated</span>
                    )}
                    {dialogue.state === "GENERATED" && selectedGenerationId && (
                        <span className="text-[10px] text-emerald-600">· selected</span>
                    )}
                    {dialogue.state === "GENERATED" && !selectedGenerationId && (
                        <span className="text-[10px] text-amber-600">· pick a variant</span>
                    )}
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
                                {VARIANT_OPTIONS.map((opt) => (
                                    <Button
                                        key={opt}
                                        variant={dialogue.numVariants === opt ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => onVariantChange(dialogue.id, opt)}
                                        className="h-6 w-6 p-0 text-[10px]"
                                    >
                                        {opt}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRegenerate(dialogue.id)}
                                disabled={isGenerating}
                                className="h-7 gap-1 text-xs"
                            >
                                <RotateCcw className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                                {dialogue.state === "INITIAL" ? "Generate" : "Re-generate"}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                        <MoreVertical className="h-3.5 w-3.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem disabled={isFirst} onClick={() => onMoveUp(dialogue.id)}>
                                        <ArrowUp className="mr-2 h-4 w-4" /> Move Up
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled={isLast} onClick={() => onMoveDown(dialogue.id)}>
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
                    className="text-sm resize-none min-h-[80px] mb-3"
                    autoFocus
                />
            ) : (
                <p className="text-sm text-foreground leading-relaxed mb-3">{dialogue.text}</p>
            )}

            {/* Generation variants */}
            {dialogue.generations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {dialogue.generations.map((gen, idx) => (
                        <GenerationPlayer
                            key={gen.id}
                            generation={gen}
                            generationNumber={idx + 1}
                            isSelected={selectedGenerationId === gen.id}
                            isGenerating={isGenerating}
                            onSelect={() => onSelectGeneration(dialogue.id, gen.id)}
                        />
                    ))}
                </div>
            )}
        </article>
    );
}
