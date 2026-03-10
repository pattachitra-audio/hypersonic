import { AudioBook, AudioBookWithCharacterVoices, AudioBookWithCharacterVoicesSchema } from "@/schemas/AudioBook";
import z from "zod";
import { tRPC } from "@/utils/tRPC";
import { useEffect, useRef, useState } from "react";
import { produce } from "immer";
import debug from "debug";
import { useDebounce } from "./useDebounce";
import { AsyncStateType, SuccessAsyncStateType } from "@/app/types/AsyncState";
import { TRPCError } from "@trpc/server";

const logger = debug("UseAudioBookForDialogueSynthesisPhase");
debug.enable("UseAudioBookForDialogueSynthesisPhase");

export type AudioBookWithCharacterVoicesSuccessAsyncStateType = SuccessAsyncStateType<AudioBookWithCharacterVoices>;
export type AudioBookWithCharacterVoicesAsyncStateType = AsyncStateType<AudioBookWithCharacterVoices>;

export function useAudioBookForDialogueSynthesisPhase(projectID: string) {
    const query = tRPC.project.get.useQuery(projectID);

    const [audioBookWithCharacterVoicesState, setAudioBookWithCharacterVoicesState] =
        useState<AudioBookWithCharacterVoicesAsyncStateType>({ status: "PENDING" });

    // const init = useRef(true);
    // const [syncStatus, setSyncStatus] = useState<"IDLE" | "PENDING" | "SUCCESS" | "ERROR">("SUCCESS");

    // const debouncedValue = useDebounce(audioBookState.state === "success" ? audioBookState.audioBook : null, 5000);

    useEffect(() => {
        if (query.status === "pending") {
            return;
        }

        (async function () {
            if (query.status === "error") {
                setAudioBookWithCharacterVoicesState({
                    status: "ERROR",
                    error: new Error(query.error.message, { cause: query.error }),
                });
                return;
            }

            const audioBook = query.data;
            const audioBookWithCharacterVoices = await AudioBookWithCharacterVoicesSchema.parseAsync(audioBook);

            setAudioBookWithCharacterVoicesState({ status: "SUCCESS", data: audioBookWithCharacterVoices });
        })();
    }, [query.status, query.data, query.error, setAudioBookWithCharacterVoicesState]);

    return { audioBookWithCharacterVoicesState };
}
