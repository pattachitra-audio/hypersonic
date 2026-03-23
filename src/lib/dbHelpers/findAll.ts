import { NoThrow } from "@/utils/NoThrow";
import { Collection, Document, MongoError } from "mongodb";

export default async function findAll<T extends Document>(collection: Collection<T>) {
    try {
        const result = await collection.find().toArray();
        console.log("result:", result);
        return NoThrow.success(result);
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
