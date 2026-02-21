import { MongoClient, MongoError } from "mongodb";
import { packageJSON } from "./packageJSON";
import { envPromise } from "./env";
import NoThrow from "@/utils/NoThrow";

export const dbClientPromise = (async function () {
    const envResult = await envPromise;

    if (envResult.isErr()) {
        return envResult;
    }

    const env = envResult.value;

    const mongoClient = new MongoClient(env.MONGODB_URI, { appName: packageJSON.name });

    try {
        const mongoClientConnected = await mongoClient.connect();
        return NoThrow.ok(mongoClientConnected);
    } catch (err) {
        return NoThrow.err(err as MongoError);
    }
})();
