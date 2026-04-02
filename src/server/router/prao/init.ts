import { OWNER_ID } from "@/backendConstants";
import { RedisClientResultAsync } from "@/lib/RedisClient";
import {
    ElevenLabsAccountWithProxyDocumentType,
    ElevenLabsAccountWithProxyRepositoryResultAsync,
} from "@/repository/ElevenLabsAccountWithProxyRepository";
import { PRAOSessionRepositoryResultAsync } from "@/repository/PRAOSession";
import { tRPCProcedure } from "@/server/tRPC";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { PRAOResource } from "@/utils/prao/resource";
import { TRPCError } from "@trpc/server";
import { Result, ResultAsync } from "neverthrow";

export const initProcedure = tRPCProcedure.mutation(async () => {
    try {
        const result = await initPRAO();
    } catch (error) {
        if (error instanceof TRPCError) {
            return error;
        }

        return new Error("Unknown error in tRPC procedure", { cause: error });
    }
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

export function initPRAO() {
    return ResultAsync.combine([
        ElevenLabsAccountWithProxyRepositoryResultAsync,
        PRAOSessionRepositoryResultAsync,
        RedisClientResultAsync,
    ]).andThen(([ElevenLabsAccountWithProxyRepository, PRAOSessionRepository, redisClient]) =>
        ElevenLabsAccountWithProxyRepository.findAllByOwnerID(OWNER_ID).andThen((accounts) => {
            const accountIDs = accounts.map((account) => account._id);

            return PRAOSessionRepository.insertOne({ userID: OWNER_ID, accountIDs }).andThen(
                ({ insertedId: sessionID }) =>
                    ResultAsync.combine(
                        accounts.map((account: ElevenLabsAccountWithProxyDocumentType) =>
                            PRAOResource.new(account._id, account.proxyURL, account.firebaseAuthCreds.refreshToken),
                        ),
                    )

                        .andThen((resources) => Result.combine(resources.map(PRAOResource.serializeToJSON)))

                        .andThen((resourcesSerialized) =>
                            redisClient.set(`sessionID@${sessionID}`, JSON.stringify(resourcesSerialized)),
                        ),
            );
        }),
    );
}
