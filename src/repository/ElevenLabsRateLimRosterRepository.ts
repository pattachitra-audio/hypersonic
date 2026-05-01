import { RedisClientResultAsync } from "@/lib/RedisClient";
import { parseJSON } from "@/utils/parseJSON";
import { ElevenLabsRateLimLaneRoster } from "@/utils/prao/ElevenLabs/lanes/rateLim/roster";
import { ObjectId } from "mongodb";
import { ok } from "neverthrow";

function generateKey(id: ObjectId) {
    return `ElevenLabsRateLimLaneRoster@${id}`;
}

export const ElevenLabsRateLimRosterRepositoryResultAsync = RedisClientResultAsync.andThen((RedisClient) => {
    return ok({
        set(allocationID: ObjectId, roster: ElevenLabsRateLimLaneRoster) {
            return ElevenLabsRateLimLaneRoster.serializeToJSON(roster)
                .map(JSON.stringify)
                .andThen((s) => RedisClient.set(generateKey(allocationID), s));
        },

        get(allocationID: ObjectId) {
            return RedisClient.get(generateKey(allocationID))
                .andThen(parseJSON)
                .andThen(ElevenLabsRateLimLaneRoster.deserializeFromJSON);
        },

        del(allocationID: ObjectId) {
            return RedisClient.del(generateKey(allocationID));
        },
    });
});
