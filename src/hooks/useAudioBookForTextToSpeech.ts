import { AudioBook } from "@/schemas/AudioBook";
import { CharacterVoice, ElevenLabsTextToSpeechVoiceSettings } from "@/schemas/Character";
import { tRPC } from "@/utils/tRPC";
import { useEffect, useState } from "react";
import { produce } from "immer";

type AudioBookState =
    | {
          state: "loading";
      }
    | { state: "error" }
    | {
          state: "success";
          data: AudioBook;
      };

function doNothing(..._args: readonly unknown[]) {
    void _args;
}

export function useAudioBookForTextToSpeech(projectID: string) {
    console.log("useAudioBookForTextToSpeech");
    const query = tRPC.project.get.useQuery(projectID);
    const [audioBook, setAudioBook] = useState<AudioBookState>({ state: "loading" });

    useEffect(() => {
        if (query.isLoading) {
            return;
        }

        (async function () {
            if (query.isError) {
                setAudioBook({ state: "error" });
            } else {
                setAudioBook({ state: "success", data: query.data! });
                console.log("AudioBook:", query.data);
            }
        })();
    }, [query.isLoading, query.isError, query.data]);

    const handleSelectVoice =
        audioBook.state !== "success"
            ? doNothing
            : (characterIndex: number, voice: CharacterVoice | null) => {
                  const draftFn = (audioBookPrevState: AudioBook) => {
                      const character = audioBookPrevState.characters.at(characterIndex);

                      if (character === undefined) {
                          return;
                      }

                      character.voice = voice === null ? undefined : voice;
                  };

                  const audioBookDataNextStateFn = () => {
                      return produce(audioBook.data, draftFn);
                  };

                  setAudioBook(() => ({ state: "success", data: audioBookDataNextStateFn() }));
              };

    const handleSettingsChange =
        audioBook.state !== "success"
            ? doNothing
            : <T extends keyof ElevenLabsTextToSpeechVoiceSettings, V extends ElevenLabsTextToSpeechVoiceSettings[T]>(
                  characterIndex: number,
                  key: T,
                  value: V,
              ) => {
                  /*
        setVoiceSettings((prev) => ({
            ...prev,
            [characterId]: settings,
        }));
        */
                  // characters.at();
                  console.log("TODO: Implement handleSettingsChange...");
              };

    return { audioBook, handleSelectVoice, handleSettingsChange };
}
