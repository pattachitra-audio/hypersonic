import z from "zod";
import { tRPCProcedure } from "@/server/tRPC";
import { ObjectId } from "mongodb";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { PRAOAllocationRepositoryResultAsync } from "@/repository/PRAOAllocation";
import { ElevenLabsPoolRepositoryResultAsync } from "@/repository/ElevenLabsPool";
import { ResultAsync } from "neverthrow";
import { TRPCError } from "@trpc/server";
import { ElevenLabsCreditRosterRepositoryResultAsync } from "@/repository/ElevenLabsCreditRosterRepository";
import { ElevenLabsFreeRosterRepositoryResultAsync } from "@/repository/ElevenLabsFreeRosterRepository";

const InputSchema = z.object({
    allocationID: z
        .hex()
        .length(24)
        .transform((string, context) => {
            try {
                return ObjectId.createFromHexString(string);
            } catch (error) {
                context.addIssue({
                    code: "custom",
                    message: getErrorMessage(error),
                });

                return z.NEVER;
            }
        }),
});

export const destroyProcedure = tRPCProcedure.input(InputSchema).mutation(async ({ input }) => {
    const result = await destroy(input.allocationID);

    if (result.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            cause: result.error,
            message: getErrorMessage(result.error),
        });
    }

    return result.value;
});

function destroy(allocationID: ObjectId) {
    return ResultAsync.combine([
        PRAOAllocationRepositoryResultAsync,
        ElevenLabsPoolRepositoryResultAsync,
        ElevenLabsCreditRosterRepositoryResultAsync,
        ElevenLabsFreeRosterRepositoryResultAsync,
    ])
        .andThen(
            ([
                PRAOAllocationRepository,
                ElevenLabsPoolRepository,
                ElevenLabsCreditRosterRepository,
                ElevenLabsFreeRosterRepository,
            ]) =>
                PRAOAllocationRepository.deleteOneByID(allocationID).andThen((allocation) =>
                    ResultAsync.combine([
                        ElevenLabsPoolRepository.unlockMany(allocation.accountIDs),
                        ElevenLabsCreditRosterRepository.del(allocationID),
                        ElevenLabsFreeRosterRepository.del(allocationID),
                    ]),
                ),
        )
        .map(() => {});
}
