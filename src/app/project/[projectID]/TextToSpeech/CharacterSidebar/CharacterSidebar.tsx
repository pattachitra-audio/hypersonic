"use client";

import { useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { CharacterDetails } from "./CharacterDetails";
import CharacterDetails from "../CharacterDetails";
import { cn } from "@/lib/utils";
import { CharacterVoice, ElevenLabsTextToSpeechVoiceSettings } from "@/schemas/Character";
import { SelectedCharacterType } from "@/app/types/SelectedCharacter";
// import { VoiceSettings } from "@/ext/elevenLabsAPI/textToSpeech";

export default function CharacterSidebar({
    selectedCharacter,
    // voiceSettings,
    onVoiceChange,
    onVoiceSettingsChange,
    onClose,
}: {
    selectedCharacter: SelectedCharacterType;
    // voiceSettings: VoiceSettings;
    onVoiceChange: (voice: CharacterVoice | null) => void;
    onVoiceSettingsChange: <
        T extends keyof ElevenLabsTextToSpeechVoiceSettings,
        V extends ElevenLabsTextToSpeechVoiceSettings[T],
    >(
        key: T,
        value: V,
    ) => void;
    onClose: () => void;
    // dialogues: { characterId: number; text: string }[];
}) {
    const [showVoiceSelector, setShowVoiceSelector] = useState(false);
    const { character, dialogues } = selectedCharacter;

    const handleClose = () => {
        setShowVoiceSelector(false);
        onClose();
    };

    return (
        <div
            className={cn(
                "border-l bg-card transition-all duration-300 ease-in-out overflow-hidden",
                character ? "w-95" : "w-0",
            )}
        >
            {character && (
                <div className="h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b shrink-0">
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
                            {
                                <CharacterDetails
                                    character={character}
                                    onSelectVoiceButtonClick={() => setShowVoiceSelector(true)}
                                    onVoiceSettingsChange={onVoiceSettingsChange}
                                    // onSelectVoiceButtonClick={() => setShowVoiceSelector(true)}
                                    // onSelectVoiceButtonClick={()}

                                    dialogues={dialogues}
                                />
                            }
                        </div>

                        {/* Voice Selector View */}
                        {/*<div
                            className={cn(
                                "absolute inset-0 transition-all duration-300 ease-out",
                                showVoiceSelector
                                    ? "opacity-100 translate-x-0"
                                    : "opacity-0 translate-x-4 pointer-events-none",
                            )}
                        >
                            <VoiceSelector onSelectVoice={handleVoiceSelect} />
                        </div> */}
                    </div>
                </div>
            )}
        </div>
    );
}
