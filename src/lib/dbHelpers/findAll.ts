import { Collection, Document } from "mongodb";
import { ResultAsync } from "neverthrow";
import { handleMongoError } from "./handleMongoError";

export default function findAll<T extends Document>(collection: Collection<T>) {
    return ResultAsync.fromPromise(collection.find().toArray(), handleMongoError);
}
