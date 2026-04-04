import { err, ok, ResultAsync } from "neverthrow";
import { EnvResultAsync } from "./Env";
import { createClient, RedisArgument } from "redis";

function handleRedisError(error: unknown) {
    return new Error("Redis error", { cause: error });
}

function filterNullResultFactory(message: string) {
    return function (result: string | null) {
        if (result === null) {
            return err(new Error(message));
        }

        return ok(result);
    };
}

export const RedisClientResultAsync = EnvResultAsync.andThen((env) => {
    const redisClient = createClient({
        url: env.REDIS_URL,
    });

    return ResultAsync.fromPromise(redisClient.connect(), (error: unknown) => {
        return new Error("Redis connection error", { cause: error });
    });
}).map((redisClient) => {
    return {
        set(key: RedisArgument, value: number | RedisArgument) {
            return ResultAsync.fromPromise(redisClient.set(key, value), handleRedisError).andThen(
                filterNullResultFactory(`[Redis] SET returned 'null'`),
            );
        },
        get(key: RedisArgument) {
            return ResultAsync.fromPromise(redisClient.get(key), handleRedisError).andThen(
                filterNullResultFactory(`[Redis] Key '${key}' not found`),
            );
        },

        del(key: RedisArgument) {
            return ResultAsync.fromPromise(redisClient.del(key), handleRedisError).andThen((result) => {
                if (result === 0) {
                    return err(new Error(`[Redis] Failed to delete key '${key}'`));
                }

                return ok();
            });
        },
    };
});
