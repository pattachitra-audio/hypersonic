import { NEGATIVE_INFINITY } from "@/constants";
import { ElevenLabsRateLimRosterRepositoryResultAsync } from "@/repository/ElevenLabsRateLimRosterRepository";
import { tRPCProcedure } from "@/server/tRPC";
import { enhanceDialogue } from "@/services/elevenLabsInternalAPI/enhanceDialogue";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ElevenLabsRateLimLaneEntry } from "@/utils/prao/ElevenLabs/lanes/rateLim/entry";
import { ElevenLabsRateLimLaneOrchestrator } from "@/utils/prao/ElevenLabs/lanes/rateLim/orchestrator";
import { zodParseAsync } from "@/utils/zodParse";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import z from "zod";

const InputSchema = z.object({
    praoAllocationID: z.hex().length(24).transform(ObjectId.createFromHexString),
    dialogue: z.string(),
});

const OutputSchema = z.string();

export const enhanceDialogueProcedure = tRPCProcedure.input(InputSchema).query(async ({ input: validatedInput }) => {
    const result = await fn(validatedInput);

    if (result.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            cause: result.error,
            message: getErrorMessage(result.error),
        });
    }

    return result.value;
});

function fn({ praoAllocationID, dialogue }: { praoAllocationID: ObjectId; dialogue: string }) {
    function spendFn(entry: ElevenLabsRateLimLaneEntry) {
        return entry.resource.idToken
            .andThen((idToken) =>
                enhanceDialogue({
                    bearerToken: idToken,
                    proxyURL: entry.resource.context.proxyURL,
                    dialogueBlocks: [dialogue],
                }),
            )
            .map(({ enhancedBlocks }) => ({ result: enhancedBlocks[0], cost: 1 }));
    }

    return ElevenLabsRateLimRosterRepositoryResultAsync.andThen((ElevenLabsRateLimRosterRepository) =>
        ElevenLabsRateLimRosterRepository.get(praoAllocationID),
    )
        .andThen((roster) => ElevenLabsRateLimLaneOrchestrator.spend(roster, NEGATIVE_INFINITY, spendFn))
        .andThen((result) => zodParseAsync(OutputSchema, result));
}
