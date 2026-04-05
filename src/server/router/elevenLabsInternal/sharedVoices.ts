import z from "zod";
import { tRPCProcedure } from "@/server/tRPC";
import { PRAOSessionRepositoryResultAsync } from "@/repository/PRAOSession";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import { ResultAsync } from "neverthrow";
import { ElevenLabsFreeSessionRepositoryResultAsync } from "@/repository/ElevenLabsFreeSessionRepository";
import { ElevenLabsFreeSession } from "@/utils/prao/ElevenLabsFree/session";
import { ElevenLabsFreeEngine } from "@/utils/prao/ElevenLabsFree/engine";
import { sharedVoices } from "@/services/elevenLabsInternalAPI/sharedVoices";
import { omit } from "lodash";
import { getErrorMessage } from "@/utils/getErrorMessage";

const InputSchema = z.object({
    praoSesssionID: z.hex().length(24).transform(ObjectId.createFromHexString),
    searchQuery: z.string().optional(),
    sort: z.enum(["TRENDING"]).optional(),
    pageSize: z.number().min(1).max(100).optional(),
    pageNum: z.int(),
});

export const sharedVoicesProcedure = tRPCProcedure.input(InputSchema).query(async ({ input: validatedInput }) => {
    const result = await fn(validatedInput);

    if (result.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            cause: result.error,
            message: getErrorMessage(result.error),
        });
    }

    return result.value;
});

function fn(input: z.output<typeof InputSchema>) {
    /* PRAOSessionRepositoryResultAsync.andThen((PRAOSessionRepository) =>
        PRAOSessionRepository.findOneByID(validatedInput.praoSesssionID),
    ).andThen((praoSession) => {
        const sessionID = praoSession._id;

        RedisClientResultAsync;
    }); */
    // TODO: Complete this
    /* ResultAsync.combine([PRAOSessionRepositoryResultAsync, RedisClientResultAsync ]).andThen(([PRAOSessionRepository, RedisClient]) => 
        PRAOSessionRepository.findOneByID(input.praoSesssionID).andThen(praoSesssion => {
            // praoSesssion.
            RedisClient.get(`sessionID@${praoSesssion._id}`).andThen(parseJSON).andThen(PRAOSession.deserializeFromJSON).andThen(PRAOEngine.fromSession).andThen((praoEngine) => {
                praoEngine.spend(0)
            })
        })
    ) */
    // const = await PRAOSessionRepositoryResultAsync;
    /*

    if (PRAOSessionRepositoryResultAsyncResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to init 'PRAOSessionRepository'",
        });
    }

    const PRAOSessionRespository = PRAOSessionRepositoryResultAsyncResult.value;

    const findOneResult = await PRAOSessionRespository.findOneByID(validatedInput.praoSesssionID);

    if (findOneResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to find session with id ${validatedInput.praoSesssionID.toHexString()}`,
        });
    }

    const = await RedisClientResultAsync;

    if (RedisClientResultAsyncResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to init 'redisClient'",
        });
    }

    const redisClient = RedisClientResultAsyncResult.value;

    const redisSessionResult = await redisClient.get(`sessionID@${validatedInput.praoSesssionID}`);

    if (redisSessionResult === null) {
    }
    */
    return ResultAsync.combine([PRAOSessionRepositoryResultAsync, ElevenLabsFreeSessionRepositoryResultAsync]).andThen(
        ([PRAOSessionRepository, ElevenLabsFreeSessionRepository]) =>
            ElevenLabsFreeSessionRepository.get(input.praoSesssionID)
                .andThen(ElevenLabsFreeSession.new)
                .andThen((session) =>
                    ElevenLabsFreeEngine.spend(session)
                        .andThen((resource) => resource.getIDToken().map((idToken) => ({ resource, idToken })))
                        .andThen(({ idToken, resource }) =>
                            sharedVoices({
                                bearerToken: idToken,
                                proxyURL: resource.context.proxyURL,
                                ...omit(input, "praoSession"),
                            }).map((sharedVoices) => ({ sharedVoices, resource })),
                        )
                        .map(({ sharedVoices, resource }) => {
                            resource.decrementBalance(1);
                            return sharedVoices;
                        }),
                ),
    );
}
