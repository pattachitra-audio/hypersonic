import { RedisClientResultAsync } from "@/lib/RedisClient";
import { parseJSON } from "@/utils/parseJSON";
import { ElevenLabsFreeLaneRoster } from "@/utils/prao/ElevenLabs/lanes/free/roster";
import { ObjectId } from "mongodb";
import { ok } from "neverthrow";

export const ElevenLabsFreeRosterRepositoryResultAsync = RedisClientResultAsync.andThen((RedisClient) => {
    return ok({
        set(allocationID: ObjectId, roster: ElevenLabsFreeLaneRoster) {
            return ElevenLabsFreeLaneRoster.serializeToJSON(roster)
                .map(JSON.stringify)
                .andThen((s) => RedisClient.set(`ElevenLabsFreeLaneRoster@${allocationID}`, s));
        },

        get(allocationID: ObjectId) {
            return RedisClient.get(`ElevenLabsFreeLaneRoster@${allocationID}`)
                .andThen(parseJSON)
                .andThen(ElevenLabsFreeLaneRoster.deserializeFromJSON);
        },
    });
});
