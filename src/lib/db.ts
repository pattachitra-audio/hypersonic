import { envPromise } from "./env";
import NoThrow from "neverthrow";
import { MongoClient, MongoError } from "mongodb";
import { packageJSON } from "./packageJSON";

export const dbClientPromise = (async function () {
    const envResult = await envPromise;

    if (envResult.isErr()) {
        return envResult;
    }

    const env = envResult.value;

    const mongoClient = new MongoClient(env.MONGODB_URI, { appName: packageJSON.name });

    try {
        const mongoClientConnected = await mongoClient.connect();
        return new NoThrow.Ok(mongoClientConnected);
    } catch (err) {
        return new NoThrow.Err(err as MongoError);
    }
})();
