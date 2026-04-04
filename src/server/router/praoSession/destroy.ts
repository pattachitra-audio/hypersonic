import z from "zod";
import { tRPCProcedure } from "@/server/tRPC";
import { ObjectId } from "mongodb";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { PRAOSessionRepositoryResultAsync } from "@/repository/PRAOSession";
import { ElevenLabsAccountWithProxyRepositoryResultAsync } from "@/repository/ElevenLabsAccountWithProxyRepository";
import { ResultAsync } from "neverthrow";
import { RedisClientResultAsync } from "@/lib/RedisClient";
import { TRPCError } from "@trpc/server";

const InputSchema = z.object({
    sessionID: z
        .hex()
        .length(24)
        .transform((string, context) => {
            try {
                return ObjectId.createFromHexString(string);
            } catch (error) {
                context.addIssue({
                    code: "custom",
                    message: getErrorMessage(error),
                });

                return z.NEVER;
            }
        }),
});

export const destroyProcedure = tRPCProcedure.input(InputSchema).mutation(async ({ input }) => {
    const result = await destroy(input.sessionID);

    if (result.isErr()) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            cause: result.error,
            message: getErrorMessage(result.error),
        });
    }

    return result.value;
});

export function destroy(sessionID: ObjectId) {
    return ResultAsync.combine([
        PRAOSessionRepositoryResultAsync,
        ElevenLabsAccountWithProxyRepositoryResultAsync,
        RedisClientResultAsync,
    ])
        .andThen(([PRAOSessionRepositoryResultAsync, ElevenLabsAccountWithProxyRepository, RedisClient]) =>
            PRAOSessionRepositoryResultAsync.deleteOneByID(sessionID).andThen((session) =>
                ResultAsync.combine([
                    ElevenLabsAccountWithProxyRepository.unlockMany(session.accountIDs),
                    RedisClient.del(`ElevenLabsCreditsSession@${sessionID}`),
                    RedisClient.del(`ElevenLabsFreeSession@${sessionID}`),
                ]),
            ),
        )
        .map(() => {});
}
