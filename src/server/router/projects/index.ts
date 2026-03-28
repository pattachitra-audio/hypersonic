import { AudioBookRepositoryPromise } from "@/repository/AudioBookRepository";
import { tRPCProcedure, tRPCRouter } from "../../tRPC";
import { TRPCError } from "@trpc/server";

export type AudioBookSummaryType = {
    id: string;
    name: string;
    plot: string;
    genre: string[];

    numCharacters: number;
    numEpisodes: number;
    numScenes: number;
    numDialogues: number;

    createdAt: number;
    updatedAt: number;
    lastAccessedAt: number;
    status: "ACTIVE" | "ARCHIVED" | "DELETED";
};

export const projectsRouter = tRPCRouter({
    get: tRPCProcedure.query(async () => {
        const AudioBookRepositoryResult = await AudioBookRepositoryPromise;

        if (AudioBookRepositoryResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to init 'AudioBookModel'",
                // cause: AudioBookRepositoryResult.error.cause,
            });
        }

        const AudioBookRepository = AudioBookRepositoryResult.value;
        const findAllSummariesResult = await AudioBookRepository.findAllSummaries();

        if (findAllSummariesResult.isErr()) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to find 'audioBookSummaries'",
            });
        }

        return findAllSummariesResult.value.map(({ id, createdAt, updatedAt, lastAccessedAt, ...rest }) => ({
            id: id.toString("hex"),
            createdAt: createdAt.getTime(),
            updatedAt: updatedAt.getTime(),
            lastAccessedAt: lastAccessedAt.getTime(),
            ...rest,
        })) satisfies AudioBookSummaryType[];
    }),
});
