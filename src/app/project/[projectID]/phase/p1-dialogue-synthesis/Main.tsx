"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Episode from "./Episode";
import { RotateCcw } from "lucide-react";
import { AudioBookTypeForDialogueSynthesisPhase } from "@/hooks/useAudioBookForDialogueSynthesisPhase";

export type GlobalGenerationSettingsType = {
    numVariants: number;
    parallelism: number;
};

export default function Main({ audioBook }: { audioBook: AudioBookTypeForDialogueSynthesisPhase }) {
    const [generating] = useState(false);
    const [globalGenerationSettings, setGlobalGenerationSettings] = useState<GlobalGenerationSettingsType>({
        numVariants: 2,
        parallelism: 8,
    });

    /* function generate() {
        // setIsGenerating(true);
        setGenerating(true);

        /* setDialogues((prev) =>
            prev.map((d) =>
                d.state === "INITIAL"
                    ? { ...d, state: "GENERATING", generations: makePlaceholderGenerations(d.id, d.numVariants) }
                    : d,
            ),
        ); * /
        // TODO: replace with real TTS API calls
        setTimeout(() => {
            setDialogues((prev) =>
                prev.map((d) =>
                    d.state === "GENERATING"
                        ? { ...d, state: "GENERATED", generations: makeGenerations(d.id, d.numVariants) }
                        : d,
                ),
            );
            setGener(false);
        }, 3000);
    }

    function handleApplyToAll() {
        setDialogues((prev) => prev.map((d) => ({ ...d, numVariants })));
    }

    function regenerate(id: string) {
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
                    d.id === id ? { ...d, state: "GENERATED", generations: makeGenerations(d.id, d.numVariants) } : d,
                ),
            );
        }, 3000);
    }

    */
    /*function handleSelectGeneration(dialogueId: string, generationId: string) {
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
        /*/

    // ── Render ────────────────────────────────────────────────────────────────

    const onApplyToAll = () => {};
    const updateSetting = useCallback(
        <Key extends keyof GlobalGenerationSettingsType, Value extends GlobalGenerationSettingsType[Key]>(
            key: Key,
            value: Value,
        ) => {
            setGlobalGenerationSettings((settings) => ({
                ...settings,
                [key]: value,
            }));
        },
        [setGlobalGenerationSettings],
    );

    return (
        <main data-scroll-container className="flex-1 flex flex-col overflow-auto bg-background pretty-scrollbar">
            <GlobalConfigBar settings={globalGenerationSettings} {...{ generating, updateSetting, onApplyToAll }} />

            {audioBook.episodes.map((_, index) => (
                <Episode key={index} {...{ audioBook, index }} />
            ))}
        </main>
    );
}

function GlobalConfigBar({
    settings,
    generating,
    updateSetting,
    onApplyToAll,
}: {
    settings: GlobalGenerationSettingsType;
    generating: boolean;
    updateSetting: <Key extends keyof GlobalGenerationSettingsType, Value extends GlobalGenerationSettingsType[Key]>(
        key: Key,
        value: Value,
    ) => void;
    onApplyToAll: () => void;
}) {
    const VARIANT_OPTIONS = [1, 2, 4, 6, 8];

    return (
        <div
            data-global-config-bar
            className="shrink-0 sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-8 py-3 flex items-center gap-5 flex-wrap"
        >
            {/* Variants */}
            <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Variants</Label>
                <div className="flex gap-0.5">
                    {VARIANT_OPTIONS.map((optionValue, index) => (
                        <Button
                            key={index}
                            variant={settings.numVariants === optionValue ? "default" : "ghost"}
                            size="sm"
                            onClick={() => updateSetting("numVariants", optionValue)}
                            className="h-7 w-7 p-0 text-xs"
                        >
                            {optionValue}
                        </Button>
                    ))}
                </div>
                <Button variant="outline" size="sm" onClick={onApplyToAll} className="h-7 text-xs">
                    Apply to all
                </Button>
            </div>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-3 flex-1 max-w-xs">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Parallelism</Label>
                <Slider
                    min={10}
                    max={100}
                    step={5}
                    value={[settings.parallelism]}
                    onValueChange={(value) => updateSetting("parallelism", value[0])}
                    onValueCommit={(value) => updateSetting("parallelism", value[0])}
                    className="flex-1"
                />
                <span className="text-xs font-semibold text-primary w-6 text-right tabular-nums">
                    {settings.parallelism}
                </span>
            </div>

            <Button
                onClick={onApplyToAll}
                disabled={generating}
                className="ml-auto gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
                <RotateCcw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
                {generating ? "Generating..." : "Generate all"}
            </Button>
        </div>
    );
}
