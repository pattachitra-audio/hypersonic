import { OWNER_ID } from "@/constants";
import { insertOne } from "@/lib/dbHelpers/insertOne";
import { ElevenLabsAccountWithProxyRepositoryPromise } from "@/repository/ElevenLabsAccountWithProxyRepository";
import { PRAOSessionRepositoryPromise } from "@/repository/PRAOSession";
import { tRPCProcedure, tRPCRouter } from "@/server/tRPC";
import { exchangeRefreshTokenForIDToken } from "@/services/elevenLabsFirebase/exchangeRefreshTokenForIDToken";
import { user } from "@/services/elevenLabsInternalAPI/user";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { TRPCError } from "@trpc/server";

export const praoRouter = tRPCRouter({
    init: tRPCProcedure.mutation(async () => {
        const ElevenLabsAccountWithProxyRepositoryResult = await ElevenLabsAccountWithProxyRepositoryPromise;

        if (ElevenLabsAccountWithProxyRepositoryResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'ElevenLabsAccountWithProxyRepository'",
                cause: ElevenLabsAccountWithProxyRepositoryResult.error,
            });
        }

        const ElevenLabsAccountWithProxyRepository = ElevenLabsAccountWithProxyRepositoryResult.value;

        const ownerID = OWNER_ID;
        const findAllByUserIDResult = await ElevenLabsAccountWithProxyRepository.findAllByOwnerID(ownerID);

        if (findAllByUserIDResult.isErr()) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `Failed to find all elevenLabs accounts for current ownerID`,
            });
        }

        const accounts = findAllByUserIDResult.value;
        const accountIDs = accounts.map((account) => account._id);

        const PRAOSessionRepositoryResult = await PRAOSessionRepositoryPromise;

        if (PRAOSessionRepositoryResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'PRAOSessionRepository'",
                cause: PRAOSessionRepositoryResult.error,
            });
        }

        const PRAOSessionRepository = PRAOSessionRepositoryResult.value;

        const insertOneResult = await PRAOSessionRepository.insertOne({ userID: ownerID, accountIDs });

        if (insertOneResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(insertOneResult.error),
                cause: insertOneResult.error,
            });
        }

        const sessionID = insertOneResult.value.insertedId;

        const idTokenPromises = await Promise.all(
            accounts.map((account) =>
                exchangeRefreshTokenForIDToken({
                    proxyURL: account.proxyURL,
                    refreshToken: account.firebaseAuthCreds.refreshToken,
                }),
            ),
        );
        
        const isError = idTokenPromises.reduce((idTokenResult => idTokenResult.isErr()), false);
        const idTokens = idTokenPromises.map(idTokenResult => )

        const userInfoPromises = accounts.map(account => user({proxyURL: account.proxyURL, bearerToken: account.firebaseAuthCreds})

        return;
    }),
});
