import { OWNER_ID } from "@/backendConstants";
import { ElevenLabsAccountWithProxyRepositoryResultAsync } from "@/repository/ElevenLabsAccountWithProxyRepository";
import { tRPCProcedure } from "@/server/tRPC";
import { TRPCError } from "@trpc/server";

export const getProcedure = tRPCProcedure.query(async () => {
    const ElevenLabsAccountWithProxyRepositoryResult = await ElevenLabsAccountWithProxyRepositoryResultAsync;

    if (ElevenLabsAccountWithProxyRepositoryResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to init 'ElevenLabsAccountWithProxyRepository'",
            cause: ElevenLabsAccountWithProxyRepositoryResult.error,
        });
    }

    const ElevenLabsAccountWithProxyRepository = ElevenLabsAccountWithProxyRepositoryResult.value;

    const ownerID = OWNER_ID;

    const findAllResult = await ElevenLabsAccountWithProxyRepository.findAllSummariesByOwnerID(ownerID);

    if (findAllResult.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error finding all 'elevenLabsAccountsWithProxy",
        });
    }

    return findAllResult.value;
});
