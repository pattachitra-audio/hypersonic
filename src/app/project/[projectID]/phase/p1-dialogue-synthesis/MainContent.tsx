"use client";

import { useState } from "react";
import { AudioBook } from "@/schemas/AudioBook";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, MapPin, Clock } from "lucide-react";
import DialogueRow from "./DialogueRow";
import { Generation } from "./GenerationPlayer";

// ── Types ────────────────────────────────────────────────────────────────────

type DialogueState = "INITIAL" | "GENERATING" | "GENERATED";

export interface DialogueGeneration {
    id: string;
    dialogueIndex: number;
    characterIndex: number;
    text: string;
    numVariants: number;
    state: DialogueState;
    generations: Generation[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const VARIANT_OPTIONS = [1, 2, 4, 6, 8];

function initDialogues(audioBook: AudioBook): DialogueGeneration[] {
    return audioBook.dialogues.map((d, index) => ({
        id: `dialogue-${index}`,
        dialogueIndex: index,
        characterIndex: d.character,
        text: d.text,
        numVariants: 2,
        state: "INITIAL",
        generations: [],
    }));
}

function makePlaceholderGenerations(dialogueId: string, count: number): Generation[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `${dialogueId}-gen-${i}-${Date.now()}`,
        audioUrl: "",
        duration: 0,
    }));
}

function makeGenerations(dialogueId: string, count: number): Generation[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `${dialogueId}-gen-${i}-${Date.now()}`,
        audioUrl: "",
        duration: Math.floor(Math.random() * 15) + 5,
    }));
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MainContent({ audioBook }: { audioBook: AudioBook }) {
    const [dialogues, setDialogues] = useState<DialogueGeneration[]>(() => initDialogues(audioBook));
    const [selectedGenerations, setSelectedGenerations] = useState<Record<string, string>>({});
    const [numVariants, setNumVariants] = useState(2);
    const [localParallelism, setLocalParallelism] = useState(20);
    const [parallelism, setParallelism] = useState(20);
    const [isGenerating, setIsGenerating] = useState(false);

    // ── Handlers ──────────────────────────────────────────────────────────────

    function handleGenerateAll() {
        setIsGenerating(true);
        setDialogues((prev) =>
            prev.map((d) =>
                d.state === "INITIAL"
                    ? { ...d, state: "GENERATING", generations: makePlaceholderGenerations(d.id, d.numVariants) }
                    : d,
            ),
        );
        // TODO: replace with real TTS API calls
        setTimeout(() => {
            setDialogues((prev) =>
                prev.map((d) =>
                    d.state === "GENERATING"
                        ? { ...d, state: "GENERATED", generations: makeGenerations(d.id, d.numVariants) }
                        : d,
                ),
            );
            setIsGenerating(false);
        }, 3000);
    }

    function handleApplyToAll() {
        setDialogues((prev) => prev.map((d) => ({ ...d, numVariants })));
    }

    function handleRegenerate(id: string) {
        setDialogues((prev) =>
            prev.map((d) =>
                d.id === id
                    ? { ...d, state: "GENERATING", generations: makePlaceholderGenerations(d.id, d.numVariants) }
                    : d,
            ),
        );
        // TODO: replace with real TTS API call
        setTimeout(() => {
            setDialogues((prev) =>
                prev.map((d) =>
                    d.id === id
                        ? { ...d, state: "GENERATED", generations: makeGenerations(d.id, d.numVariants) }
                        : d,
                ),
            );
        }, 3000);
    }

    function handleSelectGeneration(dialogueId: string, generationId: string) {
        setSelectedGenerations((prev) => ({ ...prev, [dialogueId]: generationId }));
    }

    function handleVariantChange(id: string, n: number) {
        setDialogues((prev) => prev.map((d) => (d.id === id ? { ...d, numVariants: n } : d)));
    }

    function handleTextChange(id: string, text: string) {
        setDialogues((prev) => prev.map((d) => (d.id === id ? { ...d, text } : d)));
    }

    function handleMoveUp(id: string) {
        setDialogues((prev) => {
            const idx = prev.findIndex((d) => d.id === id);
            if (idx <= 0) return prev;
            const next = [...prev];
            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
            return next.map((d, i) => ({ ...d, dialogueIndex: i }));
        });
    }

    function handleMoveDown(id: string) {
        setDialogues((prev) => {
            const idx = prev.findIndex((d) => d.id === id);
            if (idx >= prev.length - 1) return prev;
            const next = [...prev];
            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
            return next.map((d, i) => ({ ...d, dialogueIndex: i }));
        });
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
            {/* ── Config bar ── */}
            <div className="shrink-0 sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-8 py-3 flex items-center gap-5 flex-wrap">
                {/* Variants */}
                <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Variants</Label>
                    <div className="flex gap-0.5">
                        {VARIANT_OPTIONS.map((opt) => (
                            <Button
                                key={opt}
                                variant={numVariants === opt ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setNumVariants(opt)}
                                className="h-7 w-7 p-0 text-xs"
                            >
                                {opt}
                            </Button>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleApplyToAll} className="h-7 text-xs">
                        Apply to all
                    </Button>
                </div>

                <div className="h-4 w-px bg-border" />

                {/* Parallelism */}
                <div className="flex items-center gap-3 flex-1 max-w-xs">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Parallelism</Label>
                    <Slider
                        min={10}
                        max={100}
                        step={5}
                        value={[localParallelism]}
                        onValueChange={(v) => setLocalParallelism(v[0])}
                        onValueCommit={(v) => setParallelism(v[0])}
                        className="flex-1"
                    />
                    <span className="text-xs font-semibold text-primary w-6 text-right tabular-nums">
                        {localParallelism}
                    </span>
                </div>

                <Button
                    onClick={handleGenerateAll}
                    disabled={isGenerating}
                    className="ml-auto gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                    <RotateCcw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                    {isGenerating ? "Generating…" : "Generate All"}
                </Button>
            </div>

            {/* ── Dialogue list ── */}
            <div className="flex-1 overflow-y-auto pretty-scrollbar">
                {audioBook.scenes.map((scene, sceneIdx) => {
                    const sceneDialogues = dialogues.slice(scene.dialogueBegin, scene.dialogueEnd);
                    const selectedCount = sceneDialogues.filter((d) => !!selectedGenerations[d.id]).length;

                    return (
                        <section key={sceneIdx}>
                            {/* Scene header — sticky below config bar */}
                            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-8 py-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-0.5">
                                            Scene {sceneIdx + 1}
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
                                        {selectedCount} / {sceneDialogues.length} selected
                                    </span>
                                </div>
                            </div>

                            {/* Dialogues */}
                            <div className="px-8">
                                {sceneDialogues.map((dialogue) => (
                                    <DialogueRow
                                        key={dialogue.id}
                                        dialogue={dialogue}
                                        character={audioBook.characters[dialogue.characterIndex]}
                                        selectedGenerationId={selectedGenerations[dialogue.id]}
                                        isFirst={dialogue.dialogueIndex === 0}
                                        isLast={dialogue.dialogueIndex === dialogues.length - 1}
                                        onRegenerate={handleRegenerate}
                                        onSelectGeneration={handleSelectGeneration}
                                        onVariantChange={handleVariantChange}
                                        onTextChange={handleTextChange}
                                        onMoveUp={handleMoveUp}
                                        onMoveDown={handleMoveDown}
                                    />
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </main>
    );
}
