import { DEFAULT_USER_ID } from "@/backendConstants";
import { ElevenLabsPoolRepositoryResultAsync } from "@/repository/ElevenLabsPool";
import { tRPCProcedure } from "@/server/tRPC";
import { TRPCError } from "@trpc/server";

export const getProcedure = tRPCProcedure.query(async () => {
    const ElevenLabsPoolRepositoryResult = await ElevenLabsPoolRepositoryResultAsync;

    if (ElevenLabsPoolRepositoryResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to init 'ElevenLabsPoolRepositoryResult'",
            cause: ElevenLabsPoolRepositoryResult.error,
        });
    }

    const ElevenLabsPoolRepository = ElevenLabsPoolRepositoryResult.value;

    const ownerID = DEFAULT_USER_ID;

    const findAllResult = await ElevenLabsPoolRepository.findAllSummariesByOwnerID(ownerID);

    if (findAllResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error finding accounts in 'elevenLabsPool'",
        });
    }

    return findAllResult.value;
});
