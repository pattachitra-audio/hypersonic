import { NoThrow } from "@/utils/NoThrow";
import { envPromise } from "./env";
import { createClient } from "redis";

export const redisClientPromise = (async function () {
    const envResult = await envPromise;

    if (envResult.isErr()) {
        return envResult;
    }

    const env = envResult.value;

    const redisClient = createClient({
        url: env.REDIS_URL,
    });

    try {
        return await redisClient.connect();
    } catch (error) {
        return NoThrow.createError("Redis connection error", { cause: error });
    }
})();
