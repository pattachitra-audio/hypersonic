import { RedisClientResultAsync } from "@/lib/RedisClient";
import { parseJSONArray } from "@/utils/parseJSON";
import { ElevenLabsFreeResource } from "@/utils/prao/ElevenLabsFree/resource";
import { ObjectId } from "mongodb";
import { ok, Result } from "neverthrow";

export const ElevenLabsFreeSessionRepositoryResultAsync = RedisClientResultAsync.andThen((RedisClient) => {
    return ok({
        set(sessionID: ObjectId, resources: ElevenLabsFreeResource[]) {
            return Result.combine(resources.map(ElevenLabsFreeResource.serializeToJSON))
                .map(JSON.stringify)
                .asyncAndThen((s) => RedisClient.set(`ElevenLabsCreditsSession@${sessionID}`, s));
        },

        get(sessionID: ObjectId) {
            return RedisClient.get(`ElevenLabsCreditsSession@${sessionID}`)
                .andThen(parseJSONArray)
                .andThen((resources) => Result.combine(resources.map(ElevenLabsFreeResource.deserializeFromJSON)));
        },
    });
});
