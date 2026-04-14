import { DEFAULT_USER_ID } from "@/backendConstants";
import { ElevenLabsCreditRosterRepositoryResultAsync } from "@/repository/ElevenLabsCreditRosterRepository";
import { PRAOAllocationRepositoryResultAsync } from "@/repository/PRAOAllocation";
import { tRPCProcedure } from "@/server/tRPC";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { TRPCError } from "@trpc/server";
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

function fn() {
    return ResultAsync.combine([
        PRAOAllocationRepositoryResultAsync,
        ElevenLabsCreditRosterRepositoryResultAsync,
    ]).andThen(([PRAOAllocationRepository, ElevenLabsCreditRosterRepository]) =>
        PRAOAllocationRepository.findAllByUserID(DEFAULT_USER_ID).andThen((allocations) =>
            ResultAsync.combine(
                allocations.map((allocation) =>
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
                ),
            ),
        ),
    );
}
