import { ElevenLabsAccountWithProxyRepositoryPromise } from "@/repository/ElevenLabsAccountWithProxyRepository";
import { ElevenLabsAccountWithProxySchema } from "@/schemas/ElevenLabsAccountWithProxy";
import { tRPCProcedure, tRPCRouter } from "@/server/tRPC";
import { getUser } from "@/services/elevenLabsAPI/user";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { TRPCError } from "@trpc/server";
import { omit } from "lodash";
import { MongoError } from "mongodb";

export const elevenLabsAccountWithProxyRouter = tRPCRouter({
    create: tRPCProcedure.input(ElevenLabsAccountWithProxySchema).mutation(async ({ input }) => {
        const ElevenLabsAccountWithProxyRepositoryResult = await ElevenLabsAccountWithProxyRepositoryPromise;

        if (ElevenLabsAccountWithProxyRepositoryResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'ElevenLabsAccountWithProxyRepository'",
                cause: ElevenLabsAccountWithProxyRepositoryResult.error.cause,
            });
        }

        const ElevenLabsAccountWithProxyRepository = ElevenLabsAccountWithProxyRepositoryResult.value;

        const proxyURL =
            `http://${input.proxy.username}:${input.proxy.password}@${input.proxy.host}:${input.proxy.port}` as const;

        const elevenLabsAPIResult = await getUser({ apiKey: input.apiKey, proxyURL });

        if (elevenLabsAPIResult.isErr()) {
            const error = elevenLabsAPIResult.error;

            throw new TRPCError({
                code: "BAD_REQUEST",
                message: getErrorMessage(error),
                cause: error.cause,
            });
        }

        const elevenLabsAPIResponse = elevenLabsAPIResult.value;

        const insertOneResult = await ElevenLabsAccountWithProxyRepository.insertOne({
            _id: elevenLabsAPIResponse.userID,
            ...omit(input, "proxy"),
            proxyURL,
        });

        if (insertOneResult.isErr()) {
            const error = insertOneResult.error;

            console.log("error:", error);
            if (error instanceof MongoError && error.code === 11000) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `User ID: ${elevenLabsAPIResponse.userID} already present`,
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
                cause: ElevenLabsAccountWithProxyRepositoryResult.error.cause,
            });
        }

        const ElevenLabsAccountWithProxyRepository = ElevenLabsAccountWithProxyRepositoryResult.value;

        const findAllResult = await ElevenLabsAccountWithProxyRepository.findAllSummaries();

        if (findAllResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error finding all 'elevenLabsAccountsWithProxy",
            });
        }
    }),
});
