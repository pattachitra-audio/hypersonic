import { RedisClientResultAsync } from "@/lib/RedisClient";
import { parseJSON } from "@/utils/parseJSON";
import { ElevenLabsCreditLaneRoster } from "@/utils/prao/ElevenLabs/lanes/credit/roster";
import { ObjectId } from "mongodb";
import { ok } from "neverthrow";

export const ElevenLabsCreditRosterRepositoryResultAsync = RedisClientResultAsync.andThen((RedisClient) => {
    return ok({
        set(sessionID: ObjectId, roster: ElevenLabsCreditLaneRoster) {
            return ElevenLabsCreditLaneRoster.serializeToJSON(roster)
                .map(JSON.stringify)
                .andThen((s) => RedisClient.set(`ElevenLabsCreditLaneRoster@${sessionID}`, s));
        },

        get(sessionID: ObjectId) {
            return RedisClient.get(`ElevenLabsCreditLaneRoster@${sessionID}`)
                .andThen(parseJSON)
                .andThen(ElevenLabsCreditLaneRoster.deserializeFromJSON);
        },
    });
});
