"use client";

import { MouseEventHandler } from "react";
import { ChevronRight, Wand2 } from "lucide-react";
import { Character, ElevenLabsTextToSpeechVoiceSettings } from "@/schemas/Character";
import { Dialogue } from "@/schemas/Dialogue";
import VoiceSettings from "./VoiceSettings";

export default function CharacterDetails({
    character,
    onSelectVoiceButtonClick,
    onVoiceSettingsChange,
    dialogues,
}: {
    character: Character;
    onVoiceSettingsChange: <
        T extends keyof ElevenLabsTextToSpeechVoiceSettings,
        V extends ElevenLabsTextToSpeechVoiceSettings[T],
    >(
        key: T,
        value: V,
    ) => void;
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
            <VoiceSettings {...{ character }} onSettingsChange={onVoiceSettingsChange} />
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
