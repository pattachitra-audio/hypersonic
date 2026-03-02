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
// console.log("here");
// logger("gadha");

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
    const query = tRPC.project.get.useQuery(projectID);
    const [audioBookState, setAudioBookState] = useState<AudioBookStateType>({ state: "pending" });

    // const audioBook = audioBookState.state === "success" ? audioBookState.audioBook : null;

    useEffect(() => {
        /*if (query.isLoading) {
            return;
        } */

        if (query.status === "pending") {
            return;
        }

        (async function () {
            if (query.status !== "success") {
                setAudioBookState({ state: "error" });
            }

            if (!query.isSuccess) {
                return;
            }

            const audioBook = query.data as AudioBook;

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
                // console.log("handleVoiceSettingsChange");

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

                    // console.log("textToSpeech:", character.voice.voiceSettings.textToSpeech);
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
