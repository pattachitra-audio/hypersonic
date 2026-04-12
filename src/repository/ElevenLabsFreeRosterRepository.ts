import { RedisClientResultAsync } from "@/lib/RedisClient";
import { parseJSON } from "@/utils/parseJSON";
import { ElevenLabsFreeLaneRoster } from "@/utils/prao/ElevenLabs/lanes/free/roster";
import { ObjectId } from "mongodb";
import { ok } from "neverthrow";

function generateKey(id: ObjectId) {
    return `ElevenLabsFreeLaneRoster@${id}`;
}

export const ElevenLabsFreeRosterRepositoryResultAsync = RedisClientResultAsync.andThen((RedisClient) => {
    return ok({
        set(allocationID: ObjectId, roster: ElevenLabsFreeLaneRoster) {
            return ElevenLabsFreeLaneRoster.serializeToJSON(roster)
                .map(JSON.stringify)
                .andThen((s) => RedisClient.set(generateKey(allocationID), s));
        },

        get(allocationID: ObjectId) {
            return RedisClient.get(generateKey(allocationID))
                .andThen(parseJSON)
                .andThen(ElevenLabsFreeLaneRoster.deserializeFromJSON);
        },

        del(allocationID: ObjectId) {
            return RedisClient.del(generateKey(allocationID));
        },
    });
});
