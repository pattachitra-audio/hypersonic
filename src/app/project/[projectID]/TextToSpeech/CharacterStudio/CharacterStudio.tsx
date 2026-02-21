"use client";

import { useState } from "react";
import CharacterTable from "../CharacterTable";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { SelectedCharacter } from "@/app/types/SelectedCharacter";
import CharacterSidebar from "../CharacterSidebar/CharacterSidebar";
import { Character } from "@/schemas/Character";
import { useAudioBookForTextToSpeech } from "@/hooks/useAudioBookForTextToSpeech";

export default function CharacterStudio() {
    const { projectID }: { projectID: string } = useParams<{ projectID: string }>();
    const response = useAudioBookForTextToSpeech(projectID);

    const [selectedCharacterIndex, setSelectedCharacterIndex] = useState<number>(-1);

    if (response.audioBook.state === "loading") {
        return <>Loading...</>;
    }

    if (response.audioBook.state === "error") {
        return <>Audiobook not found!</>;
    }

    const audioBook = response.audioBook.data;
    const { name, characters, dialogues } = audioBook;

    /*
    const [characters, setCharacters] = useState(sampleCharacters);
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
    */

    const handleSelectCharacter = (index: number) => {
        if (index < 0 || index > characters.length) {
            // return setSelectedCharacter({ index: null, dialogues: null, character: null });
            setSelectedCharacterIndex(-1);
        }

        setSelectedCharacterIndex(selectedCharacterIndex === index ? -1 : index);
    };

    function handleCloseCharacterSidebar() {
        // setSelectedCharacter({ index: null, dialogues: null });
        setSelectedCharacterIndex(-1);
    }

    const allCharactersHaveVoices = characters.reduce((prev, { voice }) => prev && voice != null, true);
    const numberCharactersAssignedVoices = characters.reduce((prev, { voice }) => prev + (voice != null ? 1 : 0), 0);

    const getDialoguesForCharacter = (characterIndex: number) => {
        return dialogues.filter((d) => d.character === characterIndex);
    };

    const getSelectedCharacter = () => {
        if (selectedCharacterIndex === -1) {
            return null;
        }

        {
            const selectedCharacterTmp: Character | undefined = characters.at(selectedCharacterIndex);

            if (selectedCharacterTmp === undefined) {
                return null;
            }
            return {
                index: selectedCharacterIndex,
                character: selectedCharacterTmp,
                dialogues: getDialoguesForCharacter(selectedCharacterIndex),
            };
        }
    };

    const selectedCharacter = getSelectedCharacter();

    console.log("selectedCharacter:", selectedCharacter);
    return (
        <div className="flex h-full bg-muted/30">
            <div className={cn("flex-1 overflow-auto p-8 transition-all duration-300 ease-out flex flex-col")}>
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">:: {name}</h1>
                        </div>
                    </div>
                </header>

                {
                    <div className="flex-1">
                        <CharacterTable
                            {...{
                                audioBook,
                                selectedCharacter,
                                onSelectCharacter: handleSelectCharacter,
                            }}
                        />
                    </div>
                }

                <div className="mt-8 p-5 rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Voice assignment progress</span>
                                <span className="font-medium">
                                    {numberCharactersAssignedVoices} / {characters.length} characters
                                </span>
                            </div>
                            <Progress value={numberCharactersAssignedVoices / characters.length} className="h-2" />
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

            {selectedCharacter !== null && (
                <CharacterSidebar
                    {...{ selectedCharacter }}
                    onVoiceChange={response.handleSelectVoice.bind(null, selectedCharacterIndex)}
                    onClose={handleCloseCharacterSidebar}
                />
            )}
        </div>
    );
}
