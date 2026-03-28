import { OWNER_ID } from "@/backendConstants";
import { createProxyURL } from "@/brands/proxyURL";
import { ElevenLabsAccountWithProxyRepositoryPromise } from "@/repository/ElevenLabsAccountWithProxyRepository";
import { ElevenLabsAccountWithProxySchema } from "@/schemas/ElevenLabsAccountWithProxy";
import { tRPCProcedure, tRPCRouter } from "@/server/tRPC";
import { signInWithPassword } from "@/services/elevenLabsFirebase/signInWithPassword";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { TRPCError } from "@trpc/server";
import { omit } from "lodash";
import { MongoError } from "mongodb";

export const elevenLabsAccountWithProxyRouter = tRPCRouter({
    add: tRPCProcedure.input(ElevenLabsAccountWithProxySchema).mutation(async ({ input }) => {
        const ElevenLabsAccountWithProxyRepositoryResult = await ElevenLabsAccountWithProxyRepositoryPromise;

        if (ElevenLabsAccountWithProxyRepositoryResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'ElevenLabsAccountWithProxyRepository'",
                cause: ElevenLabsAccountWithProxyRepositoryResult.error,
            });
        }

        const ElevenLabsAccountWithProxyRepository = ElevenLabsAccountWithProxyRepositoryResult.value;
        const proxyURLResult = createProxyURL(
            input.proxy.username,
            input.proxy.password,
            input.proxy.host,
            input.proxy.port,
        );

        if (proxyURLResult.isErr()) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Failed to create proxyURL from username: '${input.proxy.username}', password: '${input.proxy.password}, host: '${input.proxy.host}', port: '${input.proxy.port}'`,
            });
        }

        const proxyURL = proxyURLResult.value;

        const elevenLabsFirebaseSignInResult = await signInWithPassword({
            email: input.email,
            password: input.password,
            proxyURL,
        });

        if (elevenLabsFirebaseSignInResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(elevenLabsFirebaseSignInResult.error),
                cause: elevenLabsFirebaseSignInResult.error,
            });
        }

        const refreshToken = elevenLabsFirebaseSignInResult.value.refreshToken;

        const ownerID = OWNER_ID;
        const elevenLabsUserID = elevenLabsFirebaseSignInResult.value.localID;

        const insertOneResult = await ElevenLabsAccountWithProxyRepository.insertOne({
            ownerID,
            _id: elevenLabsUserID,
            ...omit(input, "proxy"),
            proxyURL,
            firebaseAuthCreds: {
                refreshToken,
            },
        });

        if (insertOneResult.isErr()) {
            const error = insertOneResult.error;

            console.log("error:", error);
            if (error instanceof MongoError && error.code === 11000) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `ElevenLabs userID '${elevenLabsUserID}' already present`,
                    cause: error.cause,
                });
            }

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to insert 'elevenLabsAccountWithProxy'",
                cause: error.cause,
            });
        }

        return insertOneResult.value.insertedId;
    }),

    get: tRPCProcedure.query(async () => {
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

        const findAllResult = await ElevenLabsAccountWithProxyRepository.findAllSummariesByOwnerID(ownerID);

        if (findAllResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error finding all 'elevenLabsAccountsWithProxy",
            });
        }
    }),
});
