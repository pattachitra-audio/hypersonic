import { AudioBookModelPromise } from "@/models/AudioBook";
import { tRPCProcedure, tRPCRouter } from "../../tRPC";
import { TRPCError } from "@trpc/server";

export const projectsRouter = tRPCRouter({
    get: tRPCProcedure.query(async () => {
        const AudioBookModelResult = await AudioBookModelPromise;

        if (AudioBookModelResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'AudioBookModel'",
                cause: AudioBookModelResult.error,
            });
        }

        const AudioBookModel = AudioBookModelResult.value;
        const findAllSummariesResult = await AudioBookModel.findAllSummaries();

        if (findAllSummariesResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to find 'audioBook' summaries",
            });
        }

        return findAllSummariesResult.value;
    }),
});
