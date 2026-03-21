import { NoThrow } from "@/utils/NoThrow";
import { Collection, Document, MongoError } from "mongodb";

export default async function findAll<T extends Document>(collection: Collection<T>) {
    try {
        const result = await collection.find().toArray();
        console.log("result:", result);
        return NoThrow.ok(result);
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
