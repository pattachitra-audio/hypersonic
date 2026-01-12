"use client";

import { useState } from "react";
import { CharacterTable } from "./CharacterTable";
import { CharacterSidebar } from "./CharacterSidebar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle2, Mic2 } from "lucide-react";
import type { Character, VoiceSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

// Sample audiobook data
const sampleCharacters: Character[] = [
    {
        id: 1,
        name: "Sarah Mitchell",
        gender: "Female",
        ageRange: [28, 35],
        voiceDescription: "Warm, professional, with a slight British accent",
        characterDescription:
            "A determined journalist investigating a corporate conspiracy. She's intelligent, resourceful, and has a dry sense of humor.",
        voiceId: null,
        dialogueCount: 47,
    },
    {
        id: 2,
        name: "James Blackwood",
        gender: "Male",
        ageRange: [42, 50],
        voiceDescription: "Deep, authoritative, commanding presence",
        characterDescription:
            "The enigmatic CEO of Blackwood Industries. Cold and calculating on the surface, but harbors a dark secret.",
        voiceId: null,
        dialogueCount: 32,
    },
    {
        id: 3,
        name: "Emma Rose",
        gender: "Female",
        ageRange: [24, 30],
        voiceDescription: "Bright, energetic, youthful tone",
        characterDescription:
            "Sarah's younger sister and tech expert. Optimistic and quick-witted, provides comic relief.",
        voiceId: null,
        dialogueCount: 28,
    },
    {
        id: 4,
        name: "Marcus Stone",
        gender: "Male",
        ageRange: [50, 60],
        voiceDescription: "Gravelly, wise, with life experience",
        characterDescription:
            "A retired detective who becomes Sarah's unlikely ally. World-weary but still driven by justice.",
        voiceId: null,
        dialogueCount: 19,
    },
    {
        id: 5,
        name: "Lily Chen",
        gender: "Female",
        ageRange: [22, 28],
        voiceDescription: "Soft, gentle, contemplative",
        characterDescription:
            "A mysterious informant with ties to Blackwood Industries. Speaks in riddles and knows more than she lets on.",
        voiceId: null,
        dialogueCount: 15,
    },
    {
        id: 6,
        name: "Narrator",
        gender: "Neutral",
        ageRange: [35, 45],
        voiceDescription: "Clear, measured, storytelling tone",
        characterDescription: "The omniscient narrator guiding the story, providing context and atmosphere.",
        voiceId: null,
        dialogueCount: 89,
    },
];

// Sample dialogues for testing voices
const sampleDialogues = [
    { characterId: 1, text: "I know you're hiding something, James. And I'm going to find out what it is." },
    { characterId: 1, text: "The evidence doesn't lie. Someone at Blackwood Industries is covering their tracks." },
    { characterId: 2, text: "Miss Mitchell, you're playing a dangerous game. Some secrets are better left buried." },
    { characterId: 2, text: "I've built this company from nothing. I won't let anyone tear it down." },
    { characterId: 3, text: "Sarah! I cracked the encryption. You're not going to believe what I found." },
    { characterId: 3, text: "Why does everything have to be so dramatic with you? Can't we just order pizza?" },
    { characterId: 4, text: "In my experience, the truth has a way of surfacing. Patience, young lady." },
    { characterId: 4, text: "I've seen this pattern before. Forty years on the force teaches you a thing or two." },
    { characterId: 5, text: "The answers you seek lie in the shadows. Look where the light doesn't reach." },
    { characterId: 5, text: "Trust is a fragile thing, Miss Mitchell. Handle it with care." },
    {
        characterId: 6,
        text: "The city lights flickered in the distance as Sarah made her decision—there was no turning back now.",
    },
    { characterId: 6, text: "Little did they know, the greatest revelation was yet to come." },
];

const defaultVoiceSettings: VoiceSettings = {
    speed: 1.0,
    stability: 0.5,
    similarity: 0.75,
    styleExaggeration: 0,
    speakerBoost: true,
};

export function CharacterStudio() {
    const [characters, setCharacters] = useState(sampleCharacters);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [voiceSettings, setVoiceSettings] = useState<Record<number, VoiceSettings>>(() => {
        const initial: Record<number, VoiceSettings> = {};
        sampleCharacters.forEach((char) => {
            initial[char.id] = { ...defaultVoiceSettings };
        });
        return initial;
    });

    const allCharactersHaveVoices = characters.every((char) => char.voiceId !== null);
    const assignedCount = characters.filter((char) => char.voiceId !== null).length;
    const progressPercentage = (assignedCount / characters.length) * 100;

    const handleSelectCharacter = (character: Character) => {
        if (selectedCharacter?.id === character.id) {
            setSelectedCharacter(null);
        } else {
            setSelectedCharacter(character);
        }
    };

    const handleVoiceChange = (characterId: number, voiceId: string) => {
        setCharacters((prev) => prev.map((char) => (char.id === characterId ? { ...char, voiceId } : char)));
    };

    const handleSettingsChange = (characterId: number, settings: VoiceSettings) => {
        setVoiceSettings((prev) => ({
            ...prev,
            [characterId]: settings,
        }));
    };

    const getDialoguesForCharacter = (characterId: number) => {
        return sampleDialogues.filter((d) => d.characterId === characterId);
    };

    return (
        <div className="flex h-full bg-muted/30">
            <div className={cn("flex-1 overflow-auto p-8 transition-all duration-300 ease-out flex flex-col")}>
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Mic2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Audiobook Characters</h1>
                            <p className="text-muted-foreground text-sm">
                                Assign voices and configure settings for each character
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    <CharacterTable
                        characters={characters}
                        selectedCharacterId={selectedCharacter?.id ?? null}
                        onSelectCharacter={handleSelectCharacter}
                    />
                </div>

                <div className="mt-8 p-5 rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Voice assignment progress</span>
                                <span className="font-medium">
                                    {assignedCount} / {characters.length} characters
                                </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                        </div>

                        <Button
                            size="lg"
                            disabled={!allCharactersHaveVoices}
                            className={cn(
                                "gap-2 transition-all duration-300 shadow-md",
                                allCharactersHaveVoices && "bg-green-600 hover:bg-green-700",
                            )}
                        >
                            {allCharactersHaveVoices ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Proceed to Generation
                                </>
                            ) : (
                                <>
                                    Proceed to Generation
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <CharacterSidebar
                character={selectedCharacter}
                voiceSettings={selectedCharacter ? voiceSettings[selectedCharacter.id] : defaultVoiceSettings}
                onVoiceChange={handleVoiceChange}
                onSettingsChange={handleSettingsChange}
                onClose={() => setSelectedCharacter(null)}
                dialogues={selectedCharacter ? getDialoguesForCharacter(selectedCharacter.id) : []}
            />
        </div>
    );
}
