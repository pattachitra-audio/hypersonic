import { INVALID_INDEX } from "@/constants";
import { cn } from "@/lib/utils";
import { useState } from "react";
import CharacterTable from "../../TextToSpeech/CharacterTable";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import CharacterSidebar from "../../TextToSpeech/CharacterSidebar";
import { AudioBookSuccessStateType } from "@/hooks/useAudioBookForTextToSpeech";
import { Character } from "@/schemas/Character";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

export default function VoiceCasting({
    // nextPhase,
    audioBookSuccessState,
}: {
    // nextPhase: () => void;
    audioBookSuccessState: AudioBookSuccessStateType;
}) {
    const { audioBook } = audioBookSuccessState;
    const { name, characters, dialogues } = audioBook;
    const [selectedCharacterIndex, setSelectedCharacterIndex] = useState<number>(-1);

    const handleSelectCharacter = (index: number) => {
        if (index < 0 || index > characters.length) {
            setSelectedCharacterIndex(INVALID_INDEX);
        }

        setSelectedCharacterIndex(selectedCharacterIndex === index ? INVALID_INDEX : index);
    };

    function handleCloseCharacterSidebar() {
        setSelectedCharacterIndex(INVALID_INDEX);
    }

    const numberCharactersAssignedVoices = characters.reduce((prev, { voice }) => prev + (voice != null ? 1 : 0), 0);

    const getDialoguesForCharacter = (characterIndex: number) => {
        return dialogues.filter((d) => d.character === characterIndex);
    };

    const getSelectedCharacter = () => {
        const selectedCharacterTmp: Character | undefined = characters.at(selectedCharacterIndex);

        if (selectedCharacterTmp === undefined) {
            return null;
        }
        return {
            index: selectedCharacterIndex,
            character: selectedCharacterTmp,
            dialogues: getDialoguesForCharacter(selectedCharacterIndex),
        };
    };

    const selectedCharacter = getSelectedCharacter();

    return (
        <div className="flex h-full w-full bg-muted/30">
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

                <ProceedToDialogueSynthesis
                    {...{ numberCharactersAssignedVoices }}
                    totalNumberCharacters={characters.length}
                />
            </div>

            {selectedCharacter !== null && (
                <CharacterSidebar
                    {...{ selectedCharacter }}
                    onVoiceSettingsChange={(key, value) => {
                        audioBookSuccessState.handleVoiceSettingsChange(selectedCharacterIndex, key, value);
                    }}
                    onVoiceChange={(voice) => {
                        audioBookSuccessState.handleSelectVoice(selectedCharacterIndex, voice);
                    }}
                    onClose={handleCloseCharacterSidebar}
                />
            )}
        </div>
    );
}

function ProceedToDialogueSynthesis({
    numberCharactersAssignedVoices,
    totalNumberCharacters,
    // nextPhase,
}: {
    numberCharactersAssignedVoices: number;
    totalNumberCharacters: number;
    // nextPhase: () => void;
}) {
    const router = useRouter();

    const allCharactersHaveVoices = numberCharactersAssignedVoices === totalNumberCharacters;
    const progress = (numberCharactersAssignedVoices / totalNumberCharacters) * 100;

    return (
        <div className="mt-8 p-5 rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Voice assignment progress:</span>
                        <span className="font-medium">
                            {numberCharactersAssignedVoices} / {totalNumberCharacters} characters
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <Button
                    size="lg"
                    disabled={!allCharactersHaveVoices}
                    // onClick={nextPhase}
                    onClick={() => router.push("./p1-dialogue-synthesis")}
                    className={cn(
                        "gap-2 transition-all duration-300 shadow-md",
                        allCharactersHaveVoices && "bg-green-600 hover:bg-green-700",
                    )}
                >
                    {"Proceed to 'Dialogue Synthesis Phase'"}
                    {allCharactersHaveVoices ? (
                        <CheckCircle2 className="h-4 w-4" />
                    ) : (
                        <ArrowRight className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    );
}
