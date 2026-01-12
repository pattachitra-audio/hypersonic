import { AudioBookModelPromise } from "@/models/AudioBook";
import { AudioBookSchema } from "@/schemas/AudioBook";
import { tRPCRouter, tRPCProcedure } from "@/server/tRPC";
import { TRPCError } from "@trpc/server";

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

        const insertResult = await AudioBookModel.insertOne(input);

        if (insertResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create audiobook",
                cause: insertResult.error,
            });
        }

        return insertResult.value;
    }),
});
