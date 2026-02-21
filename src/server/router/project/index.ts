import { AudioBookModelPromise } from "@/models/AudioBook";
import { AudioBookSchema } from "@/schemas/AudioBook";
import { tRPCRouter, tRPCProcedure } from "@/server/tRPC";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import z from "zod";

export const projectRouter = tRPCRouter({
    create: tRPCProcedure.input(AudioBookSchema).mutation(async ({ input }) => {
        const AudioBookModelResult = await AudioBookModelPromise;
        console.log(input);

        if (AudioBookModelResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'AudioBookModel'",
                cause: AudioBookModelResult.error,
            });
        }

        const AudioBookModel = AudioBookModelResult.value;

        const insertResult = await AudioBookModel.insertOne(input);

        if (insertResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create audiobook",
                cause: insertResult.error,
            });
        }

        return insertResult.value.toHexString();
    }),
    get: tRPCProcedure.input(z.hex().length(24)).query(async ({ input }) => {
        const AudioBookModelResult = await AudioBookModelPromise;
        console.log(input);

        if (AudioBookModelResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'AudioBookModel'",
                cause: AudioBookModelResult.error,
            });
        }

        const AudioBookModel = AudioBookModelResult.value;

        const findResult = await AudioBookModel.findOneByID(ObjectId.createFromHexString(input));

        if (findResult.isErr()) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No project with ID '${input}' found in db`,
            });
        }

        return findResult.value;
    }),
});
