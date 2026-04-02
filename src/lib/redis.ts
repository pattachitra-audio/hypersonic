import { ResultAsync } from "neverthrow";
import { envPromise } from "./env";
import { createClient } from "redis";

export const redisClientPromise = envPromise.andThen((env) => {
    const redisClient = createClient({
        url: env.REDIS_URL,
    });

    return ResultAsync.fromPromise(redisClient.connect(), (error: unknown) => {
        return new Error("Redis connection error", { cause: error });
    });
});
