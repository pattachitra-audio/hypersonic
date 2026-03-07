import { AudioBookModelPromise } from "@/models/AudioBook";
import { AudioBookSchema } from "@/schemas/AudioBook";
import { tRPCRouter, tRPCProcedure } from "@/server/tRPC";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import z from "zod";

export const projectRouter = tRPCRouter({
    create: tRPCProcedure.input(AudioBookSchema).mutation(async ({ input }) => {
        const AudioBookModelResult = await AudioBookModelPromise;

        if (AudioBookModelResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'AudioBookModel'",
                cause: AudioBookModelResult.error,
            });
        }

        const AudioBookModel = AudioBookModelResult.value;
        const insertOneResult = await AudioBookModel.insertOne({
            ...input,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: "ACTIVE",
        });

        if (insertOneResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create 'audioBook'",
                cause: insertOneResult.error,
            });
        }

        return insertOneResult.value.toHexString();
    }),
    get: tRPCProcedure.input(z.hex().length(24)).query(async ({ input }) => {
        const AudioBookModelResult = await AudioBookModelPromise;

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
                message: `No project with ID: '${input}' found in database`,
            });
        }

        return findResult.value;
    }),
});
