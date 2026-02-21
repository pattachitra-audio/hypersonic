import { AudioBook } from "@/schemas/AudioBook";
import {
    CharacterVoice,
    ElevenLabsTextToSpeechVoiceSettings,
    ElevenLabsTextToSpeechVoiceSettingsDefaultValue,
} from "@/schemas/Character";
import { tRPC } from "@/utils/tRPC";
import { useEffect, useState } from "react";
import { produce } from "immer";

type AudioBookStateType =
    | {
          state: "pending";
      }
    | { state: "error" }
    | {
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

export function useAudioBookForTextToSpeech(projectID: string) {
    console.log("useAudioBookForTextToSpeech");
    const query = tRPC.project.get.useQuery(projectID);
    const [audioBookState, setAudioBookState] = useState<AudioBookStateType>({ state: "pending" });

    useEffect(() => {
        if (query.isLoading) {
            return;
        }

        (async function () {
            if (query.isError || !query.data) {
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
                        audioBook: produce(audioBook, draftFn),
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
                        character.voice.voiceSettings.textToSpeech = ElevenLabsTextToSpeechVoiceSettingsDefaultValue;
                    }

                    character.voice.voiceSettings.textToSpeech[key] = value;
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

            console.log("audioBook:", audioBook);
            setAudioBookState({ state: "success", audioBook, handleSelectVoice, handleVoiceSettingsChange });
        })();
    }, [query.isLoading, query.isError, query.data]);

    return audioBookState;
}
