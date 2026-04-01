import { err, errAsync, ok, Result, ResultAsync } from "neverthrow";
import { PRAOResource } from "./resource";

export class PRAOEngine {
    private context: {
        ascendingSortedResources: { resource: PRAOResource; balance: number }[];
    };

    private constructor(ascendingSortedResources: { resource: PRAOResource; balance: number }[]) {
        this.context = {
            ascendingSortedResources,
        };
    }

    static new(resources: PRAOResource[]) {
        if (resources.length === 0) {
            return errAsync(new Error(`At least one resource is required`));
        }

        const balancesResult = ResultAsync.combine(resources.map((r) => r.getBalance()));

        return balancesResult.map((balances) => {
            const resourcesWithBalance: { resource: PRAOResource; balance: number }[] = [];

            for (let i = 0; i < balances.length; i++) {
                resourcesWithBalance.push({ resource: resources[i], balance: balances[i] });
            }

            const sorted = resourcesWithBalance.sort((a, b) => a.balance - b.balance);

            return new PRAOEngine(sorted);
        });
    }

    spend(amount: number): Result<PRAOResource, Error> {
        if (this.context.ascendingSortedResources.at(-1)!.balance < amount) {
            return err(new Error(`No resource with balance >= ${amount} exists`));
        }

        return ok(this.context.ascendingSortedResources.at(-1)!.resource);
    }
}
