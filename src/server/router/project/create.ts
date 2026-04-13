import z from "zod";
import { AudioBookSchema } from "@/schemas/AudioBook";
import { tRPCProcedure } from "@/server/tRPC";
import { AudioBookRepositoryResultAsync } from "@/repository/AudioBookRepository";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import { PRAOAllocationRepositoryResultAsync } from "@/repository/PRAOAllocation";
import { ResultAsync } from "neverthrow";
import { getErrorMessage } from "@/utils/getErrorMessage";

const InputSchema = AudioBookSchema.extend({
    allocationID: z.hex().length(24),
});

export const createProcedure = tRPCProcedure.input(InputSchema).mutation(async ({ input }) => {
    const result = await fn(input);

    if (result.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: getErrorMessage(result.error),
            cause: result.error,
        });
    }

    return result.value;
});

/*
    if (AudioBookRepositoryResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to init 'AudioBookRepository'",
        });
    }

    if (insertOneResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to insert 'audioBook'",
            cause: insertOneResult.error.cause,
        });
    }

*/

function fn(input: z.output<typeof InputSchema>) {
    return ResultAsync.combine([AudioBookRepositoryResultAsync, PRAOAllocationRepositoryResultAsync])
        .andThen(([AudioBookRepository, PRAOAllocationRepository]) => {
            const allocationID = ObjectId.createFromHexString(input.allocationID);

            return PRAOAllocationRepository.findOneByID(allocationID).andThen(() => {
                return AudioBookRepository.insertOne({
                    ...input,
                    allocationID,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lastAccessedAt: new Date(),
                    status: "ACTIVE",
                });
            });
        })
        .map(({ insertedId }) => insertedId.toString("hex"));
}
