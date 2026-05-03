import { AudioBookWithCharacterVoicesSchema } from "@/schemas/AudioBook";
import z from "zod";
import { tRPC } from "@/utils/tRPC";
import { useEffect, useState } from "react";
// import debug from "debug";
import { AsyncStateType, SuccessAsyncStateType } from "@/app/types/AsyncState";
import { getErrorMessage } from "@/utils/getErrorMessage";

// const logger = debug("UseAudioBookForDialogueSynthesisPhase");
// debug.enable("UseAudioBookForDialogueSynthesisPhase");

// export type AudioBookForDialogueSynthesisPhase = AudioBookWithCharacterVoices & AudioBookOutputType;
const AudioBookForDialogueSynthesisPhaseSchema = AudioBookWithCharacterVoicesSchema.extend({
    allocationID: z.hex().length(24),
});

export type AudioBookTypeForDialogueSynthesisPhase = z.output<typeof AudioBookForDialogueSynthesisPhaseSchema>;

export type AudioBookTypeForDialogueSynthesisPhaseSuccessAsyncStateType =
    SuccessAsyncStateType<AudioBookTypeForDialogueSynthesisPhase>;
export type AudioBookTypeForDialogueSynthesisPhaseAsyncStateType =
    AsyncStateType<AudioBookTypeForDialogueSynthesisPhase>;

export function useAudioBookForDialogueSynthesisPhase(projectID: string) {
    const query = tRPC.project.get.useQuery(projectID);

    const [audioBookState, setAudioBookState] = useState<AudioBookTypeForDialogueSynthesisPhaseAsyncStateType>({
        status: "pending",
    });

    // const init = useRef(true);
    // const [syncStatus, setSyncStatus] = useState<"IDLE" | "PENDING" | "SUCCESS" | "ERROR">("SUCCESS");

    // const debouncedValue = useDebounce(audioBookState.state === "success" ? audioBookState.audioBook : null, 5000);

    useEffect(() => {
        if (query.status === "pending") {
            return;
        }

        (async function () {
            if (query.status === "error") {
                setAudioBookState({
                    status: "error",
                    error: new Error(query.error.message, { cause: query.error }),
                });
                return;
            }

            try {
                const audioBook = await AudioBookForDialogueSynthesisPhaseSchema.parseAsync(query.data);
                setAudioBookState({ status: "success", data: audioBook });
            } catch (error) {
                setAudioBookState({
                    status: "error",
                    error: new Error(`Error parsing 'AudioBookForDialogueSynthesisPhase'`, { cause: error }),
                });
                console.log(getErrorMessage(error));
            }
        })();
    }, [query.status, query.data, query.error, setAudioBookState]);

    return { audioBookState };
}
