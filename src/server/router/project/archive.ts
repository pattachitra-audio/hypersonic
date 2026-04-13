import z from "zod";
import { tRPCProcedure } from "@/server/tRPC";
import { AudioBookRepositoryResultAsync } from "@/repository/AudioBookRepository";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";

export const archiveProcedure = tRPCProcedure.input(z.hex().length(24)).mutation(async ({ input }) => {
    const AudioBookRepositoryResult = await AudioBookRepositoryResultAsync;

    if (AudioBookRepositoryResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to init 'AudioBookRepository'",
            // cause: AudioBookRepositoryResult.error.cause,
        });
    }

    const AudioBookRepository = AudioBookRepositoryResult.value;
    const id = ObjectId.createFromHexString(input);

    const updateOneResult = await AudioBookRepository.updateOne(
        { _id: id, status: "ACTIVE" },
        { $set: { status: "ARCHIVED" } },
    );

    if (updateOneResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update 'active' project with ID: ${input}`,
            cause: updateOneResult.error.cause,
        });
    }

    if (updateOneResult.value.modifiedCount !== 1) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `Failed to update 'active' project with ID: ${input}`,
        });
    }

    return;
});
