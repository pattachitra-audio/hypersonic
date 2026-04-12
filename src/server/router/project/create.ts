import z from "zod";
import { AudioBookSchema } from "@/schemas/AudioBook";
import { tRPCProcedure } from "@/server/tRPC";
import { AudioBookRepositoryResultAsync } from "@/repository/AudioBookRepository";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";

const InputSchema = AudioBookSchema.extend({
    allocationID: z.hex().length(24),
});

export const createProcedure = tRPCProcedure.input(InputSchema).mutation(async ({ input }) => {
    const AudioBookRepositoryResult = await AudioBookRepositoryResultAsync;

    if (AudioBookRepositoryResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to init 'AudioBookRepository'",
        });
    }

    const AudioBookRepository = AudioBookRepositoryResult.value;
    const insertOneResult = await AudioBookRepository.insertOne({
        ...input,
        allocationID: ObjectId.createFromHexString(input.allocationID),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastAccessedAt: new Date(),
        status: "ACTIVE",
    });

    if (insertOneResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to insert 'audioBook'",
            cause: insertOneResult.error.cause,
        });
    }

    return insertOneResult.value.insertedId.toString("hex");
});
