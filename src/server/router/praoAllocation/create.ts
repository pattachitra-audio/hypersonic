import z from "zod";
import { OWNER_ID } from "@/backendConstants";
import { tRPCProcedure } from "@/server/tRPC";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { TRPCError } from "@trpc/server";
import { err, ok, okAsync, ResultAsync } from "neverthrow";
import { ObjectId, WithId } from "mongodb";
import { ElevenLabsPoolDocumentType, ElevenLabsPoolRepositoryResultAsync } from "@/repository/ElevenLabsPool";
import { PRAOAllocationRepositoryResultAsync } from "@/repository/PRAOAllocation";
import { ElevenLabsCreditRosterRepositoryResultAsync } from "@/repository/ElevenLabsCreditRosterRepository";
import { ElevenLabsFreeRosterRepositoryResultAsync } from "@/repository/ElevenLabsFreeRosterRepository";
import { ElevenLabsCreditLaneEntry } from "@/utils/prao/ElevenLabs/lanes/credit/entry";
import { ElevenLabsResource } from "@/utils/prao/ElevenLabs/resource";
import { ElevenLabsFreeLaneEntry } from "@/utils/prao/ElevenLabs/lanes/free/entry";
import { ElevenLabsCreditLaneRoster } from "@/utils/prao/ElevenLabs/lanes/credit/roster";
import { ElevenLabsFreeLaneRoster } from "@/utils/prao/ElevenLabs/lanes/free/roster";

const InputSchema = z.object({
    accountIDs: z.array(z.string()),
});

export const createProcedure = tRPCProcedure.input(InputSchema).mutation(async ({ input }) => {
    const result = await fn(input.accountIDs);

    if (result.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            cause: result.error,
            message: getErrorMessage(result.error),
        });
    }

    return result.value;
});

function filterUnlockedAccounts(accounts: WithId<ElevenLabsPoolDocumentType>[]) {
    for (const account of accounts) {
        if (account.allocationID) {
            return err(
                new Error(
                    `ElevenLabs account with id '${account._id}' is already tied to allocation id '${account.allocationID}`,
                ),
            );
        }
    }

    return ok(accounts as Omit<WithId<ElevenLabsPoolDocumentType>, "allocationID">[]);
}

function fn(accountIDs: string[]) {
    return ResultAsync.combine([ElevenLabsPoolRepositoryResultAsync, PRAOAllocationRepositoryResultAsync]).andThen(
        ([ElevenLabsPoolRepository, PRAOAllocationRepository]) =>
            ElevenLabsPoolRepository.findManyByIDs(accountIDs)
                .andThen(filterUnlockedAccounts)
                .andThen((accounts) => {
                    const accountIDs = accounts.map((account) => account._id);

                    return PRAOAllocationRepository.insertOne({ userID: OWNER_ID, accountIDs }).andThen(
                        ({ insertedId: allocationID }) =>
                            ElevenLabsPoolRepository.lockMany(accountIDs, allocationID).andThen(
                                createRedisAllocationCurry(allocationID, accounts),
                            ),
                    );
                }),
    );
}

function createRedisAllocationCurry(allocationID: ObjectId, accounts: ElevenLabsPoolDocumentType[]) {
    return function () {
        return ResultAsync.combine([
            ElevenLabsCreditRosterRepositoryResultAsync,
            ElevenLabsFreeRosterRepositoryResultAsync,
        ]).andThen(([ElevenLabsCreditRosterRepository, ElevenLabsFreeRosterRepository]) =>
            ResultAsync.combine(
                accounts.map((account: ElevenLabsPoolDocumentType) =>
                    ElevenLabsResource.create(account._id, account.proxyURL, account.firebaseAuthCreds.refreshToken),
                ),
            )
                .andThen((resources) =>
                    ResultAsync.combine([
                        ResultAsync.combine(resources.map(ElevenLabsCreditLaneEntry.create)),
                        ResultAsync.combine(resources.map(ElevenLabsFreeLaneEntry.create)),
                    ]),
                )
                .andThen(([creditLaneEntries, freeLaneEntries]) =>
                    ResultAsync.combine([
                        ElevenLabsCreditLaneRoster.create(creditLaneEntries),
                        ElevenLabsFreeLaneRoster.create(freeLaneEntries),
                    ]),
                )

                .andThen(([creditLaneRoster, freeLaneRoster]) => {
                    ResultAsync.combine([
                        ElevenLabsCreditRosterRepository.set(allocationID, creditLaneRoster),
                        ElevenLabsFreeRosterRepository.set(allocationID, freeLaneRoster),
                    ]);

                    return okAsync({
                        allocationID,
                    });
                }),
        );
    };
}
