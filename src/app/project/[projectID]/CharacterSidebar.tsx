"use client";

import { useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CharacterDetails } from "./CharacterDetails";
import { VoiceSelector } from "./VoiceSelector";
import type { Character, VoiceSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CharacterSidebarProps {
    character: Character | null;
    voiceSettings: VoiceSettings;
    onVoiceChange: (characterId: number, voiceId: string) => void;
    onSettingsChange: (characterId: number, settings: VoiceSettings) => void;
    onClose: () => void;
    dialogues: { characterId: number; text: string }[];
}

export function CharacterSidebar({
    character,
    voiceSettings,
    onVoiceChange,
    onSettingsChange,
    onClose,
    dialogues,
}: CharacterSidebarProps) {
    const [showVoiceSelector, setShowVoiceSelector] = useState(false);

    const handleVoiceSelect = (voiceId: string) => {
        if (character) {
            onVoiceChange(character.id, voiceId);
            setShowVoiceSelector(false);
        }
    };

    const handleClose = () => {
        setShowVoiceSelector(false);
        onClose();
    };

    return (
        <div
            className={cn(
                "border-l bg-card transition-all duration-300 ease-in-out overflow-hidden",
                character ? "w-[380px]" : "w-0",
            )}
        >
            {character && (
                <div className="h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                        {showVoiceSelector ? (
                            <button
                                onClick={() => setShowVoiceSelector(false)}
                                className="flex items-center gap-2 text-sm font-medium hover:text-foreground/80 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Select a voice
                            </button>
                        ) : (
                            <div>
                                <h2 className="font-semibold">Voice Settings</h2>
                                <p className="text-sm text-muted-foreground">{character.name}</p>
                            </div>
                        )}
                        <Button variant="ghost" size="icon" onClick={handleClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Content - Improved animation with transform and opacity */}
                    <div className="flex-1 overflow-hidden relative">
                        {/* Character Details View */}
                        <div
                            className={cn(
                                "absolute inset-0 overflow-y-auto transition-all duration-300 ease-out",
                                showVoiceSelector
                                    ? "opacity-0 -translate-x-4 pointer-events-none"
                                    : "opacity-100 translate-x-0",
                            )}
                        >
                            <CharacterDetails
                                character={character}
                                voiceSettings={voiceSettings}
                                onSettingsChange={(settings) => onSettingsChange(character.id, settings)}
                                onVoiceButtonClick={() => setShowVoiceSelector(true)}
                                dialogues={dialogues}
                            />
                        </div>

                        {/* Voice Selector View */}
                        <div
                            className={cn(
                                "absolute inset-0 transition-all duration-300 ease-out",
                                showVoiceSelector
                                    ? "opacity-100 translate-x-0"
                                    : "opacity-0 translate-x-4 pointer-events-none",
                            )}
                        >
                            <VoiceSelector selectedVoiceId={character.voiceId} onSelectVoice={handleVoiceSelect} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
