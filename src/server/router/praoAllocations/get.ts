import { DEFAULT_USER_ID } from "@/backendConstants";
import { ElevenLabsCreditRosterRepositoryResultAsync } from "@/repository/ElevenLabsCreditRosterRepository";
import { ElevenLabsFreeRosterRepositoryResultAsync } from "@/repository/ElevenLabsFreeRosterRepository";
import { ElevenLabsRateLimRosterRepositoryResultAsync } from "@/repository/ElevenLabsRateLimRosterRepository";
import { PRAOAllocationDocumentType, PRAOAllocationRepositoryResultAsync } from "@/repository/PRAOAllocation";
import { tRPCProcedure } from "@/server/tRPC";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ElevenLabsCreditLaneRoster } from "@/utils/prao/ElevenLabs/lanes/credit/roster";
import { ElevenLabsFreeLaneRoster } from "@/utils/prao/ElevenLabs/lanes/free/roster";
import { ElevenLabsRateLimLaneRoster } from "@/utils/prao/ElevenLabs/lanes/rateLim/roster";
import { TRPCError } from "@trpc/server";
import { WithId } from "mongodb";
import { ResultAsync } from "neverthrow";

export const getProcedure = tRPCProcedure.query(async () => {
    const result = await fn();

    if (result.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: getErrorMessage(result.error),
            cause: result.error,
        });
    }

    return result.value;
});

function getRosterSummary(roster: ElevenLabsCreditLaneRoster | ElevenLabsRateLimLaneRoster | ElevenLabsFreeLaneRoster) {
    const totalBalanceResultAsync = roster.totalBalance;
    const entries = ResultAsync.combine(
        roster.entries.map((entry) => entry.balance.map((balance) => ({ id: entry.resource.id, balance }))),
    );

    return ResultAsync.combine([totalBalanceResultAsync, entries]).map(([totalBalance, entries]) => ({
        totalBalance,
        entries,
    }));
}

function getAllocationSummary(allocation: WithId<PRAOAllocationDocumentType>) {
    return ResultAsync.combine([
        ElevenLabsCreditRosterRepositoryResultAsync,
        ElevenLabsRateLimRosterRepositoryResultAsync,
        ElevenLabsFreeRosterRepositoryResultAsync,
    ])
        .andThen(
            ([
                ElevenLabsCreditRosterRepository,
                ElevenLabsRateLimLaneRosterRepository,
                ElevenLabsFreeLaneRosterRepository,
            ]) =>
                ResultAsync.combine([
                    ElevenLabsCreditRosterRepository.get(allocation._id),
                    ElevenLabsRateLimLaneRosterRepository.get(allocation._id),
                    ElevenLabsFreeLaneRosterRepository.get(allocation._id),
                ]),
        )
        .andThen(([creditLaneRoster, rateLimRoster, freeLaneRoster]) =>
            ResultAsync.combine([
                getRosterSummary(creditLaneRoster),
                getRosterSummary(rateLimRoster),
                getRosterSummary(freeLaneRoster),
            ]).map(([creditLane, rateLimLane, freeLane]) => ({
                creditLane,
                rateLimLane,
                freeLane,
            })),
        )
        .map((value) => {
            if (allocation.audioBookID) {
                return { ...value, id: allocation._id, audioBookID: allocation.audioBookID };
            } else {
                return { ...value, id: allocation._id };
            }
        });
}

function fn() {
    return PRAOAllocationRepositoryResultAsync.andThen((PRAOAllocationRepository) =>
        PRAOAllocationRepository.findAllByUserID(DEFAULT_USER_ID),
    ).andThen((allocations) => ResultAsync.combine(allocations.map(getAllocationSummary)));
}

/*
(allocation) =>
                    ElevenLabsCreditRosterRepository.get(allocation._id).andThen((creditRoster) => {
                        const entriesResultAsync = ResultAsync.combine(
                            creditRoster.entries.map((entry) =>
                                entry.balance.map((balance) => ({ id: entry.resource.id, balance })),
                            ),
                        );
                        const totalBalanceResultAsync = creditRoster.totalBalance;

                        return ResultAsync.combine([entriesResultAsync, totalBalanceResultAsync]).map(
                            ([entries, totalBalance]) => ({
                                allocationID: allocation._id.toString("hex"),
                                entries,
                                totalBalance,
                            }),
                        );
                    }),

                    */
