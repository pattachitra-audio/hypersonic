import { NoThrow } from "@/utils/NoThrow";
import { Collection, Document, MongoError, OptionalUnlessRequiredId } from "mongodb";

export async function insertOne<T extends Document>(document: OptionalUnlessRequiredId<T>, collection: Collection<T>) {
    try {
        const result = await collection.insertOne(document);

        /* if (result.acknowledged) {
                    return NoThrow.ok(result.insertedId);
                } */

        return NoThrow.ok(result);
        // return NoThrow.error(new Error("MongoDB 'insertOne' err"));
    } catch (error) {
        if (error instanceof MongoError) {
            return NoThrow.error(error);
        }

        if (error instanceof Error) {
            return NoThrow.error(error);
        }

        return NoThrow.error(new Error("Unknown error"));
    }
}
