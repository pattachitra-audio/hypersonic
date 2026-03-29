import { PRAOResource } from "./resource";
import z from "zod";

import { ok, Result, ResultAsync } from "neverthrow";
import { zodParse } from "../zodParse";

export class PRAOSession {
    constructor(public context: { resources: PRAOResource[]; totalBalance: number }) {}

    new(resources: PRAOResource[]) {
        ResultAsync.combine(resources.map((value) => value.getBalance()))
            .andThen((balances) => ok(balances.reduce((a, b) => a + b, 0)))
            .map((totalBalance) => new PRAOSession({ resources, totalBalance }));
    }

    static serializeToJSON(obj: PRAOSession) {
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
                return Result.combine(resources.map(PRAOResource.deserializeFromJSON)).map((resources) => ({
                    resources,
                    ...rest,
                }));
            })
            .map((obj) => new PRAOSession(obj));
    }
}
