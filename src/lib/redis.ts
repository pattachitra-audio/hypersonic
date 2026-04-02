import { err, ok, ResultAsync } from "neverthrow";
import { EnvResultAsync } from "./Env";
import { createClient, RedisArgument } from "redis";

export const redisClientPromise = EnvResultAsync.andThen((env) => {
    const redisClient = createClient({
        url: env.REDIS_URL,
    });

    return ResultAsync.fromPromise(redisClient.connect(), (error: unknown) => {
        return new Error("Redis connection error", { cause: error });
    });
}).map((redisClient) => {
    return {
        set(key: RedisArgument, value: number | RedisArgument) {
            return ResultAsync.fromPromise(
                redisClient.set(key, value),
                (error) => new Error("Redis error", { cause: error }),
            ).andThen((result) => {
                if (result === null) {
                    return err(new Error(`Redis SET returned 'null'`));
                }

                return ok();
            });
        },
        get(key: RedisArgument) {
            return ResultAsync.fromPromise(
                redisClient.get(key),
                (error) => new Error("Redis error", { cause: error }),
            ).andThen((result) => {
                if (result === null) {
                    return err(new Error(`Redis key ${key} not found`));
                }

                return ok(result);
            });
        },
    };
});
