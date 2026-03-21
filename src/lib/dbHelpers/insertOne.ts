import { NoThrow } from "@/utils/NoThrow";
import { Collection, Document, MongoError, OptionalUnlessRequiredId } from "mongodb";

export async function insertOne<T extends Document>(document: OptionalUnlessRequiredId<T>, collection: Collection<T>) {
    try {
        const result = await collection.insertOne(document);

        /* if (result.acknowledged) {
                    return NoThrow.ok(result.insertedId);
                } */

        return NoThrow.ok(result);
        // return NoThrow.err(new Error("MongoDB 'insertOne' err"));
    } catch (error) {
        if (error instanceof MongoError) {
            return NoThrow.err(error);
        }

        if (error instanceof Error) {
            return NoThrow.err(error);
        }

        return NoThrow.err(new Error("Unknown error"));
    }
}
