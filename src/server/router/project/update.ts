import z from "zod";
import { AudioBookSchema } from "@/schemas/AudioBook";
import { tRPCProcedure } from "@/server/tRPC";
import { AudioBookRepositoryResultAsync } from "@/repository/AudioBookRepository";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import { omit } from "lodash";

const InputSchema = AudioBookSchema.extend({ id: z.hex().length(24) });

export const updateProcedure = tRPCProcedure.input(InputSchema).mutation(async ({ input }) => {
    const AudioBookRepositoryResult = await AudioBookRepositoryResultAsync;

    if (AudioBookRepositoryResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to init 'AudioBookRepository'",
            // cause: AudioBookRepositoryResult.error.cause,
        });
    }

    const AudioBookRepository = AudioBookRepositoryResult.value;
    const id = ObjectId.createFromHexString(input.id);
    const findOneResult = await AudioBookRepository.findOneByID(id);

    if (findOneResult.isErr() || findOneResult.value === null) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `No 'active' project with ID: ${input.id} found in database`,
            // cause: findOneResult.error.cause,
        });
    }

    const updateOneResult = await AudioBookRepository.replaceOneByID(id, {
        ...omit(input, "id"),
        allocationID: findOneResult.value.allocationID,
        createdAt: findOneResult.value.createdAt,
        updatedAt: new Date(),
        lastAccessedAt: new Date(),
        status: "ACTIVE",
    });

    if (updateOneResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update 'active' project with ID: ${input.id}`,
            cause: updateOneResult.error,
        });
    }

    if (updateOneResult.value.modifiedCount !== 1) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `Failed to update 'active' project with ID: ${input.id}`,
        });
    }

    return;
});
