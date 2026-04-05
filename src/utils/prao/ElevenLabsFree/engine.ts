import { errAsync, ok, ResultAsync } from "neverthrow";
import { ElevenLabsFreeSession } from "./session";
import { ElevenLabsFreeResource } from "./resource";

export class ElevenLabsFreeEngine {
    static spend(session: ElevenLabsFreeSession): ResultAsync<ElevenLabsFreeResource, Error> {
        const {
            context: { resources },
        } = session;

        if (resources.length === 0) {
            return errAsync(new Error(`At least one resource is required`));
        }

        return ResultAsync.combine(resources.map((r) => r.getBalance()))
            .map((balances) => {
                const resourcesWithBalance: { resource: ElevenLabsFreeResource; balance: number }[] = [];

                for (let i = 0; i < balances.length; i++) {
                    resourcesWithBalance.push({ resource: resources[i], balance: balances[i] });
                }

                return resourcesWithBalance.sort((a, b) => a.balance - b.balance);
            })
            .andThen((ascendingSortedResources) => {
                return ok(ascendingSortedResources.at(-1)!.resource);
            });
    }
}
