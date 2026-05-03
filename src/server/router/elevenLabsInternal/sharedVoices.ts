import z from "zod";
import { tRPCProcedure } from "@/server/tRPC";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import { sharedVoices } from "@/services/elevenLabsInternalAPI/sharedVoices";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ElevenLabsFreeRosterRepositoryResultAsync } from "@/repository/ElevenLabsFreeRosterRepository";
import { ElevenLabsFreeLaneOrchestrator } from "@/utils/prao/ElevenLabs/lanes/free/orchestrator";
import { NEGATIVE_INFINITY } from "@/constants";
import { ElevenLabsFreeLaneEntry } from "@/utils/prao/ElevenLabs/lanes/free/entry";

const InputSchema = z.object({
    praoAllocationID: z.hex().length(24).transform(ObjectId.createFromHexString),
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
    function spendFn(entry: ElevenLabsFreeLaneEntry) {
        return entry.resource.idToken
            .andThen((idToken) =>
                sharedVoices({
                    bearerToken: idToken,
                    searchQuery: input.searchQuery,
                    sort: input.sort,
                    pageNum: input.pageNum,
                    pageSize: input.pageSize,
                    proxyURL: entry.resource.context.proxyURL,
                }),
            )
            .map((result) => ({ result, cost: 1 }));
    }

    return ElevenLabsFreeRosterRepositoryResultAsync.andThen((ElevenLabsFreeRosterRepository) =>
        ElevenLabsFreeRosterRepository.get(input.praoAllocationID)
            .andThen((roster) =>
                ElevenLabsFreeLaneOrchestrator.spend(roster, NEGATIVE_INFINITY, spendFn).map((result) => ({
                    roster,
                    result,
                })),
            )
            .andThen(({ roster, result }) =>
                ElevenLabsFreeRosterRepository.set(input.praoAllocationID, roster).map(() => result),
            ),
    );
}
