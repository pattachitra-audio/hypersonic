import { err, errAsync, ok, ResultAsync } from "neverthrow";
// import { PRAOResource } from "./resource";
// import { PRAOSession } from "./session";

export class PRAOEngine {
    static spend(session: , amount: number): ResultAsync<PRAOResource, Error> {
        const {
            context: { resources },
        } = session;

        if (resources.length === 0) {
            return errAsync(new Error(`At least one resource is required`));
        }

        return ResultAsync.combine(resources.map((r) => r.getBalance()))
            .map((balances) => {
                const resourcesWithBalance: { resource: PRAOResource; balance: number }[] = [];

                for (let i = 0; i < balances.length; i++) {
                    resourcesWithBalance.push({ resource: resources[i], balance: balances[i] });
                }

                return resourcesWithBalance.sort((a, b) => a.balance - b.balance);
            })
            .andThen((ascendingSortedResources) => {
                if (ascendingSortedResources.at(-1)!.balance < amount) {
                    return err(new Error(`No resource with balance >= ${amount} exists`));
                }

                return ok(ascendingSortedResources.at(-1)!.resource);
            });
    }
}
