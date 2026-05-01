import z from "zod";
import { tRPCProcedure } from "@/server/tRPC";
import { AudioBookRepositoryResultAsync } from "@/repository/AudioBookRepository";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import { AudioBookSchema } from "@/schemas/AudioBook";
import { zodParseAsync } from "@/utils/zodParse";
import { getErrorMessage } from "@/utils/getErrorMessage";

const InputSchema = z.hex().length(24);

const OutputSchema = AudioBookSchema.extend({
    allocationID: z.transform((value: ObjectId) => value.toString("hex")),
});

export type OutputType = z.output<typeof OutputSchema>;

export const getProcedure = tRPCProcedure.input(InputSchema).query(async ({ input }) => {
    /*
    if (AudioBookRepositoryResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to init 'AudioBookRepository'",
            // cause: AudioBookRepositoryResult.error.cause,
        });
    }

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

    findOneResult.value;
    */

    const result = await fn(input);

    if (result.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            cause: result.error,
            message: getErrorMessage(result.error),
        });
    }

    return result.value;
});

function fn(projectID: string) {
    return AudioBookRepositoryResultAsync.andThen((AudioBookRepository) =>
        AudioBookRepository.findOneByID(ObjectId.createFromHexString(projectID)),
    ).andThen((audioBookDocument) => zodParseAsync(OutputSchema, audioBookDocument));
}
