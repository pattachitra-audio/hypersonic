import z from "zod";
import { tRPCProcedure } from "@/server/tRPC";
import { PRAOSessionRepositoryResultAsync } from "@/repository/PRAOSession";
import { ObjectId } from "mongodb";
import { TRPCError } from "@trpc/server";
import { RedisClientResultAsync } from "@/lib/RedisClient";

const InputSchema = z.object({
    praoSesssionID: z.hex().length(24).transform(ObjectId.createFromHexString),
    searchQuery: z.string().optional(),
    sort: z.string().optional(),
    pageSize: z.string().min(1).max(100).optional(),
    pageNum: z.int(),
});

export const sharedVoicesProcedure = tRPCProcedure.input(InputSchema).query(async ({ input: validatedInput }) => {
    /* PRAOSessionRepositoryResultAsync.andThen((PRAOSessionRepository) =>
        PRAOSessionRepository.findOneByID(validatedInput.praoSesssionID),
    ).andThen((praoSession) => {
        const sessionID = praoSession._id;

        RedisClientResultAsync;
    }); */
    const PRAOSessionRepositoryResultAsyncResult = await PRAOSessionRepositoryResultAsync;

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

    const RedisClientResultAsyncResult = await RedisClientResultAsync;

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
});
