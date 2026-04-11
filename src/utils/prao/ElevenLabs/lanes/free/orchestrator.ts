import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { ElevenLabsFreeLaneEntry } from "./entry";
import { ElevenLabsFreeLaneRoster } from "./roster";

export type ExecuteFunctionType = (
    entry: ElevenLabsFreeLaneEntry,
) => ResultAsync<void | null | undefined | number, unknown>;

export class ElevenLabsFreeLaneOrchestrator {
    public static spend(roster: ElevenLabsFreeLaneRoster, amount: number, execute: ExecuteFunctionType) {
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
        roster: ElevenLabsFreeLaneRoster,
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
