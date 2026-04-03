import z from "zod";

import { ok, Result, ResultAsync } from "neverthrow";
import { zodParse } from "@/utils/zodParse";
import { ElevenLabsFreeResource } from "./resource";

export class ElevenLabsFreeSession {
    private constructor(public context: { resources: ElevenLabsFreeResource[]; totalBalance: number }) {}

    static new(resources: ElevenLabsFreeResource[]) {
        ResultAsync.combine(resources.map((value) => value.getBalance()))
            .andThen((balances) => ok(balances.reduce((a, b) => a + b, 0)))
            .map((totalBalance) => new ElevenLabsFreeSession({ resources, totalBalance }));
    }

    static serializeToJSON(obj: ElevenLabsFreeSession) {
        return ok({
            totalBalance: obj,
            resources: obj.context.resources,
        });
    }

    static deserializeFromJSON(obj: unknown) {
        const schema = z.object({
            totalBalance: z.int(),
            resources: z.array(z.unknown()),
        });

        return zodParse(schema, obj)
            .andThen(({ resources, ...rest }) => {
                return Result.combine(resources.map(ElevenLabsFreeResource.deserializeFromJSON)).map((resources) => ({
                    resources,
                    ...rest,
                }));
            })
            .map((obj) => new ElevenLabsFreeSession(obj));
    }
}
