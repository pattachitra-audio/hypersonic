import { RedisClientResultAsync } from "@/lib/RedisClient";
import { parseJSON } from "@/utils/parseJSON";
import { ElevenLabsFreeLaneRoster } from "@/utils/prao/ElevenLabs/lanes/free/roster";
import { ObjectId } from "mongodb";
import { ok } from "neverthrow";

export const ElevenLabsFreeRosterRepositoryResultAsync = RedisClientResultAsync.andThen((RedisClient) => {
    return ok({
        set(sessionID: ObjectId, roster: ElevenLabsFreeLaneRoster) {
            return ElevenLabsFreeLaneRoster.serializeToJSON(roster)
                .map(JSON.stringify)
                .andThen((s) => RedisClient.set(`ElevenLabsFreeLaneRoster@${sessionID}`, s));
        },

        get(sessionID: ObjectId) {
            return RedisClient.get(`ElevenLabsFreeLaneRoster@${sessionID}`)
                .andThen(parseJSON)
                .andThen(ElevenLabsFreeLaneRoster.deserializeFromJSON);
        },
    });
});
