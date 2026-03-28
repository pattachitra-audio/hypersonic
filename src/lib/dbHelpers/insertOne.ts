import { Collection, Document, OptionalUnlessRequiredId } from "mongodb";
import { ResultAsync } from "neverthrow";
import { handleMongoError } from "./handleMongoError";

export function insertOne<T extends Document>(document: OptionalUnlessRequiredId<T>, collection: Collection<T>) {
    return ResultAsync.fromPromise(collection.insertOne(document), handleMongoError);
}
