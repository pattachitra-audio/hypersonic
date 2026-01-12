"use client";

import { useState, useEffect } from "react";
import { ChevronRight, RotateCcw, Play, Pause, Sparkles, RefreshCw, Download, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Character, VoiceSettings, AudioGeneration } from "@/lib/types";
import { voices } from "@/lib/voices";
import { cn } from "@/lib/utils";

interface CharacterDetailsProps {
    character: Character;
    voiceSettings: VoiceSettings;
    onSettingsChange: (settings: VoiceSettings) => void;
    onVoiceButtonClick: () => void;
    dialogues: { characterId: number; text: string }[];
}

const defaultSettings: VoiceSettings = {
    speed: 1.0,
    stability: 0.5,
    similarity: 0.75,
    styleExaggeration: 0,
    speakerBoost: true,
};

export function CharacterDetails({
    character,
    voiceSettings,
    onSettingsChange,
    onVoiceButtonClick,
    dialogues,
}: CharacterDetailsProps) {
    const [selectedDialogue, setSelectedDialogue] = useState<string>("");
    const [testText, setTestText] = useState<string>("");
    const [generationCount, setGenerationCount] = useState<string>("1");
    const [generations, setGenerations] = useState<AudioGeneration[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);

    const selectedVoice = voices.find((v) => v.id === character.voiceId);

    const handleReset = () => {
        onSettingsChange(defaultSettings);
    };

    const handleDialogueSelect = (text: string) => {
        setSelectedDialogue(text);
        setTestText(text);
    };

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

    const handleGenerate = () => {
        if (!testText.trim()) return;
        setIsGenerating(true);
        setGenerations([]);

        const count = Number.parseInt(generationCount);
        const baseDelay = 1000;

        setTimeout(
            () => {
                const newGenerations: AudioGeneration[] = Array.from({ length: count }, (_, i) => ({
                    id: `gen-${Date.now()}-${i}`,
                    generationNumber: i + 1,
                    duration: 2 + Math.random() * 3,
                    isPlaying: false,
                }));
                setGenerations(newGenerations);
                setIsGenerating(false);
            },
            baseDelay + Math.random() * 1500,
        );
    };

    const handleRegenerate = () => {
        setGenerations([]);
        handleGenerate();
    };

    const togglePlay = (id: string) => {
        if (playingId === id) {
            setPlayingId(null);
        } else {
            setPlayingId(id);
            setTimeout(() => setPlayingId(null), 2000);
        }
    };

    const hasGenerations = generations.length > 0;

    return (
        <div className="p-5 space-y-6">
            <div className="p-4 rounded-xl bg-muted/50 space-y-4">
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        About this character
                    </h3>
                    <p className="text-sm leading-relaxed">{character.characterDescription}</p>
                </div>
                <div className="flex gap-6">
                    <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Age Range</p>
                        <p className="text-sm font-semibold">
                            {character.ageRange[0]}-{character.ageRange[1]}
                        </p>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Gender</p>
                        <p className="text-sm font-semibold">{character.gender}</p>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Dialogues</p>
                        <p className="text-sm font-semibold">{character.dialogueCount}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Voice</label>
                <button
                    onClick={onVoiceButtonClick}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-dashed hover:border-solid hover:border-primary/50 bg-background hover:bg-muted/30 transition-all duration-200 group"
                >
                    <div className="flex items-center gap-3">
                        {selectedVoice ? (
                            <>
                                <div
                                    className="w-9 h-9 rounded-full ring-2 ring-background shadow-md transition-transform duration-200 group-hover:scale-110"
                                    style={{
                                        background: `linear-gradient(135deg, ${selectedVoice.color} 0%, ${selectedVoice.colorEnd} 100%)`,
                                    }}
                                />
                                <span className="font-semibold">{selectedVoice.name}</span>
                            </>
                        ) : (
                            <>
                                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                                    <Wand2 className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <span className="text-muted-foreground">Select a voice</span>
                            </>
                        )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
                </button>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Model</label>
                <button className="w-full p-4 rounded-xl border bg-gradient-to-r from-pink-50 via-purple-50 to-orange-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-orange-950/20 hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono text-xs bg-background">
                                V2
                            </Badge>
                            <span className="font-semibold">Eleven Multilingual v2</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 text-left">The most expressive Text to Speech</p>
                </button>
            </div>

            <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Test Voice
                </label>

                <Select value={selectedDialogue} onValueChange={handleDialogueSelect}>
                    <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select a dialogue to test" />
                    </SelectTrigger>
                    <SelectContent>
                        {dialogues.map((dialogue, index) => (
                            <SelectItem key={index} value={dialogue.text}>
                                <span className="line-clamp-1">{dialogue.text.slice(0, 50)}...</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Textarea
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Enter or select text to test the voice..."
                    className="min-h-[100px] resize-none rounded-xl"
                />

                <div className="flex items-center gap-2">
                    <Select value={generationCount} onValueChange={setGenerationCount}>
                        <SelectTrigger className="w-[90px] rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                    {num} gen{num > 1 ? "s" : ""}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        className="flex-1 gap-2 rounded-xl bg-transparent"
                        disabled={!testText.trim() || isGenerating}
                        onClick={handleEnhance}
                    >
                        <Sparkles className="h-4 w-4" />
                        Enhance
                    </Button>

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

                {isGenerating && (
                    <div className="space-y-2 animate-in fade-in-50 duration-300">
                        {Array.from({ length: Number.parseInt(generationCount) }, (_, i) => (
                            <GenerationLoadingSkeleton key={i} generationNumber={i + 1} />
                        ))}
                    </div>
                )}

                {!isGenerating && generations.length > 0 && (
                    <div className="space-y-2 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        {generations.map((gen) => (
                            <AudioGenerationCard
                                key={gen.id}
                                generation={gen}
                                isPlaying={playingId === gen.id}
                                onTogglePlay={() => togglePlay(gen.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-5">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Speed</label>
                        <Badge variant="secondary" className="font-mono text-xs">
                            {voiceSettings.speed.toFixed(2)}x
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-12">Slower</span>
                        <Slider
                            value={[voiceSettings.speed]}
                            min={0.5}
                            max={2}
                            step={0.01}
                            onValueChange={([value]) => onSettingsChange({ ...voiceSettings, speed: value })}
                            className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-12 text-right">Faster</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Stability</label>
                        <Badge variant="secondary" className="font-mono text-xs">
                            {Math.round(voiceSettings.stability * 100)}%
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-12">Variable</span>
                        <Slider
                            value={[voiceSettings.stability]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={([value]) => onSettingsChange({ ...voiceSettings, stability: value })}
                            className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-12 text-right">Stable</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Similarity</label>
                        <Badge variant="secondary" className="font-mono text-xs">
                            {Math.round(voiceSettings.similarity * 100)}%
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-12">Low</span>
                        <Slider
                            value={[voiceSettings.similarity]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={([value]) => onSettingsChange({ ...voiceSettings, similarity: value })}
                            className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-12 text-right">High</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Style Exaggeration</label>
                        <Badge variant="secondary" className="font-mono text-xs">
                            {Math.round(voiceSettings.styleExaggeration * 100)}%
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-12">None</span>
                        <Slider
                            value={[voiceSettings.styleExaggeration]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={([value]) =>
                                onSettingsChange({ ...voiceSettings, styleExaggeration: value })
                            }
                            className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-12 text-right">Max</span>
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <label className="text-sm font-medium">Speaker Boost</label>
                    <Switch
                        checked={voiceSettings.speakerBoost}
                        onCheckedChange={(checked) => onSettingsChange({ ...voiceSettings, speakerBoost: checked })}
                    />
                </div>
            </div>

            <Button variant="outline" className="w-full gap-2 rounded-xl bg-transparent" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                Reset Values
            </Button>
        </div>
    );
}

function GenerationLoadingSkeleton({ generationNumber }: { generationNumber: number }) {
    return (
        <div className="p-3 rounded-xl border bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Generation {generationNumber}</p>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 animate-pulse">
                    <div className="w-4 h-4 rounded bg-muted-foreground/20" />
                </div>

                <div className="flex-1 flex items-center gap-[2px] h-8">
                    {Array.from({ length: 40 }, (_, i) => (
                        <div
                            key={i}
                            className="w-[3px] rounded-full bg-muted-foreground/20"
                            style={{
                                height: `${(Math.sin(i * 0.3) * 0.3 + 0.5) * 100}%`,
                                animation: `pulse 1s ease-in-out infinite`,
                                animationDelay: `${i * 30}ms`,
                            }}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-1">
                    <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                    <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                </div>
            </div>
        </div>
    );
}

function AudioGenerationCard({
    generation,
    isPlaying,
    onTogglePlay,
}: {
    generation: AudioGeneration;
    isPlaying: boolean;
    onTogglePlay: () => void;
}) {
    const [waveformBars, setWaveformBars] = useState<number[]>(() =>
        Array.from({ length: 40 }, (_, i) => Math.sin(i * 0.3) * 0.5 + 0.5),
    );

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setWaveformBars(Array.from({ length: 40 }, () => Math.random() * 0.8 + 0.2));
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div className="p-3 rounded-xl border bg-card hover:shadow-sm transition-shadow duration-200">
            <p className="text-xs text-muted-foreground mb-2">Generation {generation.generationNumber}</p>
            <div className="flex items-center gap-3">
                <button
                    onClick={onTogglePlay}
                    className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200",
                        isPlaying
                            ? "bg-primary text-primary-foreground scale-105"
                            : "bg-foreground text-background hover:scale-105",
                    )}
                >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </button>

                <div className="flex-1 flex items-center gap-[2px] h-8">
                    {waveformBars.map((height, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-[3px] rounded-full transition-all",
                                isPlaying ? "bg-primary duration-100" : "bg-muted-foreground/30 duration-300",
                            )}
                            style={{
                                height: `${(isPlaying ? height : Math.sin(i * 0.3) * 0.5 + 0.5) * 100}%`,
                            }}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
