import z from "zod";
import { tRPCProcedure } from "@/server/tRPC";
import { AudioBookRepositoryResultAsync } from "@/repository/AudioBookRepository";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";

export const getProcedure = tRPCProcedure.input(z.hex().length(24)).query(async ({ input }) => {
    const AudioBookRepositoryResult = await AudioBookRepositoryResultAsync;

    if (AudioBookRepositoryResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to init 'AudioBookRepository'",
            // cause: AudioBookRepositoryResult.error.cause,
        });
    }

    const AudioBookRepository = AudioBookRepositoryResult.value;
    const findOneResult = await AudioBookRepository.findOneByID(ObjectId.createFromHexString(input));

    if (findOneResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Error querying 'AudioBookRepository'`,
            cause: findOneResult.error,
        });
    }

    if (findOneResult.value === null) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `No 'active' project with ID: '${input}' found in database`,
        });
    }

    return findOneResult.value;
});
