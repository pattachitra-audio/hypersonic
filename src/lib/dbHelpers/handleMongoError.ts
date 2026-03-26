import { MongoError } from "mongodb";

export function handleMongoError(error: unknown) {
    if (error instanceof MongoError) {
        return error;
    }

    if (error instanceof Error) {
        return error;
    }

    return new Error("Unknown mongoDB error", { cause: error });
}
