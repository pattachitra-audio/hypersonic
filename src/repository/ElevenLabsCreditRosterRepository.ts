import { RedisClientResultAsync } from "@/lib/RedisClient";
import { parseJSON } from "@/utils/parseJSON";
import { ElevenLabsCreditLaneRoster } from "@/utils/prao/ElevenLabs/lanes/credit/roster";
import { ObjectId } from "mongodb";
import { okAsync } from "neverthrow";

function generateKey(id: ObjectId) {
    return `ElevenLabsCreditLaneRoster@${id}`;
}

export const ElevenLabsCreditRosterRepositoryResultAsync = RedisClientResultAsync.andThen((RedisClient) => {
    return okAsync({
        set(allocationID: ObjectId, roster: ElevenLabsCreditLaneRoster) {
            return ElevenLabsCreditLaneRoster.serializeToJSON(roster)
                .map(JSON.stringify)
                .andThen((s) => RedisClient.set(generateKey(allocationID), s));
        },

        get(allocationID: ObjectId) {
            return RedisClient.get(generateKey(allocationID))
                .andThen(parseJSON)
                .andThen(ElevenLabsCreditLaneRoster.deserializeFromJSON);
        },

        del(allocationID: ObjectId) {
            return RedisClient.del(generateKey(allocationID));
        },
    });
});
