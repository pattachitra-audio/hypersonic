"use client";

import { useState, useEffect, MouseEventHandler } from "react";
import { ChevronRight, RotateCcw, Play, Pause, RefreshCw, Download, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import type { Character, VoiceSettings, AudioGeneration } from "@/lib/types";
import { cn, newArrWithModification } from "@/lib/utils";
import {
    Character,
    ElevenLabsTextToSpeechVoiceSettings,
    ElevenLabsTextToSpeechVoiceSettingsSchema,
} from "@/schemas/Character";
import { Dialogue } from "@/schemas/Dialogue";
import { Switch } from "@/components/ui/switch";
import { textToSpeech } from "@/ext/elevenLabsAPI/textToSpeech";
import { AudioGenState } from "@/components/AudioGen/AudioGen";

// interface CharacterDetailsProps

/*
const defaultSettings: VoiceSettings = {
    speed: 1.0,
    stability: 0.5,
    similarity: 0.75,
    styleExaggeration: 0,
    speakerBoost: true,
};
*/

export default function CharacterDetails({
    character,
    onSettingsChange,
    onSelectVoiceButtonClick,
    dialogues,
}: {
    character: Character;
    onSettingsChange: (settings: ElevenLabsTextToSpeechVoiceSettings) => void;
    onSelectVoiceButtonClick: () => void;
    dialogues: Dialogue[];
}) {
    // const selectedVoice = voices.find((v) => v.id === character.voiceId);

    /*
    const handleReset = () => {
        onSettingsChange(defaultSettings);
    };

    const togglePlay = (id: string) => {
        if (playingId === id) {
            setPlayingId(null);
        } else {
            setPlayingId(id);
            setTimeout(() => setPlayingId(null), 2000);
        }
    };
    */

    // const hasGenerations = generations.length > 0;

    return (
        <div className="p-5 space-y-6">
            <CharacterDescription {...{ character, numberDialogues: dialogues.length }} />

            <SelectVoice {...{ character, onClick: onSelectVoiceButtonClick }} />
            <VoiceSettings />
            {/*<TestVoice {...{ dialogues }} /> */}
        </div>
    );
}

function SelectVoice({ character, onClick }: { character: Character; onClick: MouseEventHandler<HTMLButtonElement> }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Voice:</label>
            <button
                {...{ onClick }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-dashed hover:border-solid hover:border-primary/50 bg-background hover:bg-muted/30 transition-all duration-200 group"
            >
                <div className="flex items-center gap-3">
                    {character.voice != null ? (
                        <>
                            <div
                                className="w-9 h-9 rounded-full ring-2 ring-background shadow-md transition-transform duration-200 group-hover:scale-110"
                                style={{
                                    background: `linear-gradient(135deg, red 0%, green 100%)`,
                                }}
                            />
                            <span className="font-semibold">{character.voice.name}</span>
                        </>
                    ) : (
                        <>
                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                                <Wand2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="text-muted-foreground">Select a voice:</span>
                        </>
                    )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
            </button>
        </div>
    );
}

function CharacterDescription({ character, numberDialogues }: { character: Character; numberDialogues: number }) {
    return (
        <div className="p-4 rounded-xl bg-muted/50 space-y-4">
            <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    About this character
                </h3>
                <p className="text-sm leading-relaxed">{character.description}</p>
            </div>
            <div className="flex gap-6">
                <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Age Range</p>
                    <p className="text-sm font-semibold">
                        {character.ageGroup[0]} - {character.ageGroup[1]}
                    </p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="text-sm font-semibold">{character.gender}</p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Dialogues</p>
                    <p className="text-sm font-semibold">{numberDialogues}</p>
                </div>
            </div>
        </div>
    );
}

function TestVoice({ dialogues }: { dialogues: Dialogue[] }) {
    const [selectedDialogueIndex, setSelectedDialogueIndex] = useState("-1");
    // const [selectedDialogue, setSelectedDialogue] = useState<string>("");
    const [testText, setTestText] = useState<string>("");

    const [genCount, setGenCount] = useState(1);
    const [generations, setGenerations] = useState<AudioGenState[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasGenerations, setHasGenerations] = useState(false);
    // const [playingID, setPlayingID] = useState<string | null>(null);
    // const [genStatus, setGenStatus] = useState<"none" | "generating" | "generated">("none");

    const handleDialogueSelect = (index: string) => {
        if (index === "-1") {
            return;
        }

        const i = parseInt(index);

        if (i < 0 || i >= dialogues.length) {
            return;
        }

        setTestText(dialogues[i].text);
    };

    /*
    const handleEnhance = () => {
        if (!testText.trim()) return;

        const words = testText.split(" ");
        const enhancedWords = words.map((word, index) => {
            if (index < words.length - 1 && Math.random() < 0.3) {
                const bracketOptions = ["[pause]", "[breath]", "[emphasis]", "[softer]", "[louder]"];
                const randomBracket = bracketOptions[Math.floor(Math.random() * bracketOptions.length)];
                return `${word} ${randomBracket}`;
            }
            return word;
        });

        setTestText(enhancedWords.join(" "));
    };
    */

    const handleGenerate = () => {
        const text = testText.trim();

        if (text.length === 0) {
            return;
        }

        setIsGenerating(true);
        setHasGenerations(true);
        setGenerations(new Array(genCount).map(() => ({ status: "generating" })));

        const promises: ReturnType<typeof textToSpeech>[] = [];

        for (let idx = 0; idx < genCount; idx++) {
            const gen = textToSpeech({
                text: "Hello",
                outputFormat: "mp3_44100_128",
                voiceID: "2341",
                enableLogging: false,
                voiceSettings: { speed: 1 },
                modelID: "v3",
                applyTextNormalization: "off",
                applyLanguageTextNormalization: false,
            });

            gen.then((result) => {
                if (result.isErr()) {
                    setGenerations((curr) => newArrWithModification(curr, idx, { status: "error" }));
                } else {
                    setGenerations((curr) =>
                        newArrWithModification(curr, idx, { status: "generated", audio: result.value }),
                    );
                }
            });

            promises.push(gen);
        }

        (async function setIsGeneratingFalse() {
            await Promise.all(promises);
            setIsGenerating(false);
        })();
    };

    const handleRegenerate = () => {
        setGenerations([]);
        handleGenerate();
    };

    return (
        <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Test Voice</label>

            <Select value={selectedDialogueIndex.toString()} onValueChange={handleDialogueSelect}>
                <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a dialogue to test" />
                </SelectTrigger>
                <SelectContent>
                    {dialogues.map((dialogue, index) => (
                        <SelectItem key={index} value={index.toString()}>
                            <span className="line-clamp-1">{dialogue.text.slice(0, 50)}...</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter or select text to test the voice..."
                className="min-h-25 resize-none rounded-xl"
            />

            <div className="flex items-center gap-2">
                <Select value={genCount.toString()} onValueChange={(v) => setGenCount(parseInt(v))}>
                    <SelectTrigger className="w-22.5 rounded-xl">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                                {num} Gen{num > 1 ? "s" : ""}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/*
                <Button
                    variant="outline"
                    className="flex-1 gap-2 rounded-xl bg-transparent"
                    disabled={!testText.trim() || isGenerating}
                    onClick={handleEnhance}
                >
                    <Sparkles className="h-4 w-4" />
                    Enhance
                </Button> */}

                <Button
                    className="flex-1 gap-2 rounded-xl"
                    disabled={!testText.trim() || isGenerating}
                    onClick={hasGenerations ? handleRegenerate : handleGenerate}
                >
                    {isGenerating ? (
                        <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : hasGenerations ? (
                        <>
                            <RefreshCw className="h-4 w-4" />
                            Regenerate
                        </>
                    ) : (
                        <>
                            <Play className="h-4 w-4" />
                            Generate
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

function VoiceSettings({}) {
    const [settings, setSettings] = useState(ElevenLabsTextToSpeechVoiceSettingsSchema.decode({}));

    return (
        <>
            <div className="h-px bg-border" />

            <div className="space-y-5">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Speed</label>
                        <Badge variant="secondary" className="font-mono text-xs">
                            {settings.speed.toFixed(2)}x
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-12">Slower</span>
                        <Slider
                            value={[settings.speed]}
                            min={0.5}
                            max={2}
                            step={0.01}
                            onValueChange={([value]) => setSettings((settings) => ({ ...settings, speed: value }))}
                            className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-12 text-right">Faster</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Stability</label>
                        <Badge variant="secondary" className="font-mono text-xs">
                            {Math.round(settings.stability * 100)}%
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-12">Variable</span>
                        <Slider
                            value={[settings.stability]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={([value]) => setSettings((settings) => ({ ...settings, stability: value }))}
                            className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-12 text-right">Stable</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Similarity</label>
                        <Badge variant="secondary" className="font-mono text-xs">
                            {Math.round(settings.similarityBoost * 100)}%
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-12">Low</span>
                        <Slider
                            value={[settings.similarityBoost]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={([value]) => setSettings((settings) => ({ ...settings, similarity: value }))}
                            className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-12 text-right">High</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Style Exaggeration</label>
                        <Badge variant="secondary" className="font-mono text-xs">
                            {Math.round(settings.style * 100)}%
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-12">None</span>
                        <Slider
                            value={[settings.style]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={([value]) =>
                                setSettings((settings) => ({ ...settings, styleExaggeration: value }))
                            }
                            className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-12 text-right">Max</span>
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <label className="text-sm font-medium">Speaker Boost</label>
                    <Switch
                        checked={settings.speakerBoost}
                        onCheckedChange={(checked) =>
                            setSettings((settings) => ({ ...settings, speakerBoost: checked }))
                        }
                    />
                </div>
            </div>
        </>
    );
}
