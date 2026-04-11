import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { ElevenLabsCreditLaneRoster } from "./roster";
import { ElevenLabsCreditLaneEntry } from "./entry";

export type ExecuteFunctionType = (
    entry: ElevenLabsCreditLaneEntry,
) => ResultAsync<void | null | undefined | number, unknown>;

export class ElevenLabsCreditLaneOrchestrator {
    public static spend(roster: ElevenLabsCreditLaneRoster, amount: number, execute: ExecuteFunctionType) {
        const entries = roster.context.entries;

        if (entries.length === 0) {
            return errAsync(new Error(`At least one entry should be present in the roster`));
        }

        ResultAsync.combine(entries.map((entry) => entry.balance.map((balance) => ({ entry, balance }))))
            .map((entriesWithBalance) => entriesWithBalance.sort((a, b) => a.balance - b.balance))
            .andThen((ascendingSortedEntries) => {
                if (ascendingSortedEntries.at(-1)!.balance < amount) {
                    return errAsync(new Error(`No entry with balance >= ${amount} exists`));
                }

                return okAsync(ascendingSortedEntries.at(-1)!.entry);
            })
            .andThen((entry) =>
                execute(entry)
                    .andThen((cost) => entry.decrementBalance(cost == null ? amount : cost))
                    .orElse(() => entry.invalidateBalance()),
            );
    }

    public static spendOn(
        roster: ElevenLabsCreditLaneRoster,
        resourceID: string,
        amount: number,
        execute: ExecuteFunctionType,
    ) {
        const entry = roster.entries.find((entry) => entry.resource.id === resourceID);

        if (entry === undefined) {
            return errAsync(new Error(`No resource with id '${resourceID}'`));
        }

        entry.balance
            .andThen((balance) => {
                if (balance < amount) {
                    return errAsync(
                        new Error(
                            `Not enough balance for resource '${resourceID}'; (Balance: ${balance}, Requested: ${amount})`,
                        ),
                    );
                }

                return okAsync();
            })
            .andThen(() => {
                return execute(entry).mapErr(() => entry.invalidateBalance());
            });
    }
}
