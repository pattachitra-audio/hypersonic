import { AudioBook } from "@/schemas/AudioBook";
import {
    CharacterVoice,
    ElevenLabsTextToSpeechVoiceSettings,
    ElevenLabsTextToSpeechVoiceSettingsDefaultValue,
} from "@/schemas/Character";
import { tRPC } from "@/utils/tRPC";
import { useEffect, useState } from "react";
import { produce } from "immer";
import debug from "debug";

const logger = debug("useAudioBookForTextToSpeech");
debug.enable("useAudioBookForTextToSpeech");

export type AudioBookPendingStateType = {
    state: "pending";
};

export type AudioBookErrorStateType = { state: "error" };

export type AudioBookSuccessStateType = {
    state: "success";
    audioBook: AudioBook;
    handleSelectVoice: (characterIndex: number, voice: CharacterVoice | null) => void;
    handleVoiceSettingsChange: <
        T extends keyof ElevenLabsTextToSpeechVoiceSettings,
        V extends ElevenLabsTextToSpeechVoiceSettings[T],
    >(
        characterIndex: number,
        key: T,
        value: V,
    ) => void;
};

export type AudioBookStateType = AudioBookPendingStateType | AudioBookErrorStateType | AudioBookSuccessStateType;

export function useAudioBookForTextToSpeech(projectID: string) {
    const query = tRPC.project.get.useQuery(projectID);
    const [audioBookState, setAudioBookState] = useState<AudioBookStateType>({ state: "pending" });

    useEffect(() => {
        if (query.status === "pending") {
            return;
        }

        (async function () {
            if (query.status !== "success") {
                setAudioBookState({ state: "error" });
                return;
            }

            const audioBook = query.data;

            const handleSelectVoice = (characterIndex: number, voice: CharacterVoice | null) => {
                const draftFn = (audioBook: AudioBook) => {
                    const character = audioBook.characters.at(characterIndex);

                    if (!character) {
                        return;
                    }

                    if (!voice) {
                        delete character.voice;
                        return;
                    }

                    character.voice = voice;
                };

                setAudioBookState((audioBookState) => {
                    if (audioBookState.state !== "success") {
                        return audioBookState;
                    }

                    return {
                        ...audioBookState,
                        audioBook: produce(audioBookState.audioBook, draftFn),
                    };
                });
            };

            const handleVoiceSettingsChange = <
                T extends keyof ElevenLabsTextToSpeechVoiceSettings,
                V extends ElevenLabsTextToSpeechVoiceSettings[T],
            >(
                characterIndex: number,
                key: T,
                value: V,
            ) => {
                const draftFn = (audioBookPrevState: AudioBook) => {
                    const character = audioBookPrevState.characters.at(characterIndex);

                    if (!character) {
                        return;
                    }

                    if (!character.voice) {
                        return;
                    }

                    if (!character.voice.voiceSettings) {
                        character.voice.voiceSettings = {};
                    }

                    if (!character.voice.voiceSettings.textToSpeech) {
                        character.voice.voiceSettings.textToSpeech = structuredClone(
                            ElevenLabsTextToSpeechVoiceSettingsDefaultValue,
                        );
                    }

                    character.voice.voiceSettings.textToSpeech[key] = value;
                };

                setAudioBookState((audioBookPrevState) => {
                    if (audioBookPrevState.state !== "success") {
                        return audioBookPrevState;
                    }

                    return {
                        ...audioBookPrevState,
                        audioBook: produce(audioBookPrevState.audioBook, draftFn),
                    };
                });
            };

            logger("audioBook:", audioBook);
            setAudioBookState({ state: "success", audioBook, handleSelectVoice, handleVoiceSettingsChange });
        })();
    }, [query.status, query.data, setAudioBookState]);

    return audioBookState;
}
