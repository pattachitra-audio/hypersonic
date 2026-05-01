import { ElevenLabsCreditRosterRepositoryResultAsync } from "@/repository/ElevenLabsCreditRosterRepository";
import { ElevenLabsFreeRosterRepositoryResultAsync } from "@/repository/ElevenLabsFreeRosterRepository";
import { ElevenLabsRateLimRosterRepositoryResultAsync } from "@/repository/ElevenLabsRateLimRosterRepository";
import { PRAOAllocationRepositoryResultAsync } from "@/repository/PRAOAllocation";
import { tRPCProcedure } from "@/server/tRPC";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ElevenLabsCreditLaneRoster } from "@/utils/prao/ElevenLabs/lanes/credit/roster";
import { ElevenLabsFreeLaneRoster } from "@/utils/prao/ElevenLabs/lanes/free/roster";
import { ElevenLabsRateLimLaneRoster } from "@/utils/prao/ElevenLabs/lanes/rateLim/roster";
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

function getSummary(roster: ElevenLabsCreditLaneRoster | ElevenLabsRateLimLaneRoster | ElevenLabsFreeLaneRoster) {
    const totalBalanceResultAsync = roster.totalBalance;
    const entries = ResultAsync.combine(
        roster.entries.map((entry) => entry.balance.map((balance) => ({ id: entry.resource.id, balance }))),
    );

    return ResultAsync.combine([totalBalanceResultAsync, entries]).map(([totalBalance, entries]) => ({
        totalBalance,
        entries,
    }));
}

function fn(input: z.output<typeof InputSchema>) {
    return ResultAsync.combine([
        PRAOAllocationRepositoryResultAsync,
        ElevenLabsCreditRosterRepositoryResultAsync,
        ElevenLabsRateLimRosterRepositoryResultAsync,
        ElevenLabsFreeRosterRepositoryResultAsync,
    ]).andThen(
        ([
            PRAOAllocationRepository,
            ElevenLabsCreditRosterRepository,
            ElevenLabsRateLimLaneRosterRepository,
            ElevenLabsFreeLaneRosterRepository,
        ]) =>
            PRAOAllocationRepository.findOneByID(input.allocationID)
                .andThen((allocation) =>
                    ResultAsync.combine([
                        ElevenLabsCreditRosterRepository.get(allocation._id),
                        ElevenLabsRateLimLaneRosterRepository.get(allocation._id),
                        ElevenLabsFreeLaneRosterRepository.get(allocation._id),
                    ]),
                )
                .andThen(([creditLaneRoster, rateLimRoster, freeLaneRoster]) => {
                    return ResultAsync.combine([
                        getSummary(creditLaneRoster),
                        getSummary(rateLimRoster),
                        getSummary(freeLaneRoster),
                    ]).map(([creditLane, rateLimLane, freeLane]) => ({
                        creditLane,
                        rateLimLane,
                        freeLane,
                    }));
                }),
    );
}
