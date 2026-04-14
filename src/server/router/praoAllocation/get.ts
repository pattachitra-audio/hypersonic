import { ElevenLabsCreditRosterRepositoryResultAsync } from "@/repository/ElevenLabsCreditRosterRepository";
import { PRAOAllocationRepositoryResultAsync } from "@/repository/PRAOAllocation";
import { tRPCProcedure } from "@/server/tRPC";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import { ResultAsync } from "neverthrow";
import z from "zod";

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

export const getProcedure = tRPCProcedure.input(InputSchema).query(async ({ input }) => {
    const result = await fn(input);

    if (result.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: getErrorMessage(result.error),
            cause: result.error,
        });
    }

    return result.value;
});

function fn(input: z.output<typeof InputSchema>) {
    return ResultAsync.combine([
        PRAOAllocationRepositoryResultAsync,
        ElevenLabsCreditRosterRepositoryResultAsync,
    ]).andThen(([PRAOAllocationRepository, ElevenLabsCreditRosterRepository]) =>
        PRAOAllocationRepository.findOneByID(input.allocationID)
            .andThen((allocation) => ElevenLabsCreditRosterRepository.get(allocation._id))
            .andThen((roster) => {
                const totalBalanceResultAsync = roster.totalBalance;
                const entries = ResultAsync.combine(
                    roster.entries.map((entry) => entry.balance.map((balance) => ({ id: entry.resource.id, balance }))),
                );

                return ResultAsync.combine([totalBalanceResultAsync, entries]).map(([totalBalance, entries]) => ({
                    totalBalance,
                    entries,
                }));
            }),
    );
}
