import z from "zod";
import { OWNER_ID } from "@/backendConstants";
import { tRPCProcedure } from "@/server/tRPC";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ElevenLabsCreditsResource } from "@/utils/prao/ElevenLabsCredits/resource";
import { ElevenLabsFreeResource } from "@/utils/prao/ElevenLabsFree/resource";
import { TRPCError } from "@trpc/server";
import { err, ok, okAsync, ResultAsync } from "neverthrow";
import { ObjectId, WithId } from "mongodb";
import { ElevenLabsFreeSessionRepositoryResultAsync } from "@/repository/ElevenLabsFreeSessionRepository";
import { ElevenLabsCreditsSessionRepositoryResultAsync } from "@/repository/ElevenLabsCreditsSessionRepository";
import { ElevenLabsPoolDocumentType, ElevenLabsPoolRepositoryResultAsync } from "@/repository/ElevenLabsPool";
import { PRAOAllocationRepositoryResultAsync } from "@/repository/PRAOAllocation";

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

function filterUnlockedAccounts(accounts: WithId<ElevenLabsPoolDocumentType>[]) {
    for (const account of accounts) {
        if (account.sessionID) {
            return err(
                new Error(
                    `'ElevenLabsAccountWithProxy' id '${account._id}' is already tied to 'Session' id '${account.sessionID}`,
                ),
            );
        }
    }

    return ok(accounts as Omit<WithId<ElevenLabsPoolDocumentType>, "sessionID">[]);
}

function init(accountIDs: string[]) {
    return ResultAsync.combine([
        ElevenLabsPoolRepositoryResultAsync,
        PRAOAllocationRepositoryResultAsync,
        ElevenLabsCreditsSessionRepositoryResultAsync,
        ElevenLabsFreeSessionRepositoryResultAsync,
    ]).andThen(([ElevenLabsAccountWithProxyRepository, PRAOSessionRepository]) =>
        ElevenLabsAccountWithProxyRepository.findManyByIDs(accountIDs)
            .andThen(filterUnlockedAccounts)
            .andThen((accounts) => {
                const accountIDs = accounts.map((account) => account._id);

                return PRAOSessionRepository.insertOne({ userID: OWNER_ID, accountIDs }).andThen(
                    ({ insertedId: sessionID }) =>
                        ElevenLabsAccountWithProxyRepository.lockMany(accountIDs, sessionID).andThen(
                            initRedisSessionCurry(sessionID, accounts),
                        ),
                );
            }),
    );
}

function initRedisSessionCurry(sessionID: ObjectId, accounts: ElevenLabsPoolDocumentType[]) {
    return function () {
        return ResultAsync.combine([
            ElevenLabsCreditsSessionRepositoryResultAsync,
            ElevenLabsFreeSessionRepositoryResultAsync,
        ]).andThen(([ElevenLabsCreditsSessionRepository, ElevenLabsFreeSessionRepository]) =>
            ResultAsync.combine(
                accounts.map((account: ElevenLabsPoolDocumentType) =>
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
                .andThen(([creditsResources, freeResources]) => {
                    ResultAsync.combine([
                        ElevenLabsCreditsSessionRepository.set(sessionID, creditsResources),
                        ElevenLabsFreeSessionRepository.set(sessionID, freeResources),
                    ]);

                    return okAsync({
                        sessionID,
                    });
                }),
        );
    };
}

/* 
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
                                }), */

// resources: creditsResourcesJSON.map((o) => pick(o, "id", "balance")),
