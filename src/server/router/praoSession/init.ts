import z from "zod";
import { OWNER_ID } from "@/backendConstants";
import { RedisClientResultAsync } from "@/lib/RedisClient";
import {
    ElevenLabsAccountWithProxyDocumentType,
    ElevenLabsAccountWithProxyRepositoryResultAsync,
} from "@/repository/ElevenLabsAccountWithProxyRepository";
import { PRAOSessionRepositoryResultAsync } from "@/repository/PRAOSession";
import { tRPCProcedure } from "@/server/tRPC";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ElevenLabsCreditsResource } from "@/utils/prao/ElevenLabsCredits/resource";
import { ElevenLabsFreeResource } from "@/utils/prao/ElevenLabsFree/resource";
import { TRPCError } from "@trpc/server";
import { pick } from "lodash";
import { err, ok, okAsync, Result, ResultAsync } from "neverthrow";
import { WithId } from "mongodb";

const InputSchema = z.object({
    accountIDs: z.array(z.string()),
});

export const initProcedure = tRPCProcedure.input(InputSchema).mutation(async ({ input }) => {
    const result = await init(input.accountIDs);

    if (result.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            cause: result.error,
            message: getErrorMessage(result.error),
        });
    }

    return result.value;
});

// const ElevenLabsAccountWithProxyRepositoryResult = await ElevenLabsAccountWithProxyRepositoryResultAsync;

/* if (findAllByOwnerIDResult.isErr()) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `Failed to find all elevenLabs accounts for current ownerID`,
        });
    } */

// const accounts = findAllByOwnerIDResult.value;

/* const PRAOSessionRepositoryResult = await;

    if (PRAOSessionRepositoryResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to init 'PRAOSessionRepository'",
            cause: PRAOSessionRepositoryResult.error,
        });
    }

    const PRAOSessionRepository = PRAOSessionRepositoryResult.value; */

/* const result = await resourcesSerializedResult;

    if (result.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: getErrorMessage(result.error),
            cause: result.error,
        });
    } */

/* if (insertOneResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: getErrorMessage(insertOneResult.error),
            cause: insertOneResult.error,
        });
    } */

// const sessionID = insertOneResult.value.insertedId;

/*
    if (ElevenLabsAccountWithProxyRepositoryResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to init 'ElevenLabsAccountWithProxyRepository'",
            cause: ElevenLabsAccountWithProxyRepositoryResult.error,
        });
    }

    const ElevenLabsAccountWithProxyRepository = ElevenLabsAccountWithProxyRepositoryResult.value;
    */

function filterUnlockedAccounts(accounts: WithId<ElevenLabsAccountWithProxyDocumentType>[]) {
    for (const account of accounts) {
        if (account.sessionID) {
            return err(
                new Error(
                    `'ElevenLabsAccountWithProxy' id '${account._id}' is already tied to 'Session' id '${account.sessionID}`,
                ),
            );
        }
    }

    return ok(accounts as Omit<WithId<ElevenLabsAccountWithProxyDocumentType>, "sessionID">[]);
}

export function init(accountIDs: string[]) {
    return ResultAsync.combine([
        ElevenLabsAccountWithProxyRepositoryResultAsync,
        PRAOSessionRepositoryResultAsync,
        RedisClientResultAsync,
    ]).andThen(([ElevenLabsAccountWithProxyRepository, PRAOSessionRepository, RedisClient]) =>
        ElevenLabsAccountWithProxyRepository.findManyByID(accountIDs)
            .andThen(filterUnlockedAccounts)
            .andThen((accounts) => {
                const accountIDs = accounts.map((account) => account._id);

                return PRAOSessionRepository.insertOne({ userID: OWNER_ID, accountIDs }).andThen(
                    ({ insertedId: sessionID }) =>
                        ElevenLabsAccountWithProxyRepository.lockMany(accountIDs, sessionID).andThen(() =>
                            ResultAsync.combine(
                                accounts.map((account: ElevenLabsAccountWithProxyDocumentType) =>
                                    ResultAsync.combine([
                                        ElevenLabsCreditsResource.new(
                                            account._id,
                                            account.proxyURL,
                                            account.firebaseAuthCreds.refreshToken,
                                        ),
                                        ElevenLabsFreeResource.new(
                                            account._id,
                                            account.proxyURL,
                                            account.firebaseAuthCreds.refreshToken,
                                        ),
                                    ] as const),
                                ),
                            )

                                .map(
                                    (resources) =>
                                        [
                                            resources.map(([creditsResource]) => creditsResource),
                                            resources.map(([, freeResource]) => freeResource),
                                        ] as const,
                                )
                                .andThen(([creditsResources, freeResources]) =>
                                    Result.combine([
                                        Result.combine(creditsResources.map(ElevenLabsCreditsResource.serializeToJSON)),
                                        Result.combine(freeResources.map(ElevenLabsFreeResource.serializeToJSON)),
                                    ]),
                                )
                                .andThen(([creditsResourcesJSON, freeResourcesJSON]) => {
                                    ResultAsync.combine([
                                        RedisClient.set(
                                            `ElevenLabsCreditsSession@${sessionID}`,
                                            JSON.stringify(creditsResourcesJSON),
                                        ),
                                        RedisClient.set(
                                            `ElevenLabsFreeSession@${sessionID}`,
                                            JSON.stringify(freeResourcesJSON),
                                        ),
                                    ]);

                                    return okAsync({
                                        sessionID,
                                        resources: creditsResourcesJSON.map((o) => pick(o, "id", "balance")),
                                    });
                                }),
                        ),
                );
            }),
    );
}
