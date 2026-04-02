import { MongoClient, MongoError } from "mongodb";
import { packageJSON } from "./packageJSON";
import { EnvResultAsync } from "./Env";
import { ResultAsync } from "neverthrow";

export const DBClientResultAsync = (function () {
    return EnvResultAsync.andThen((env) => {
        const mongoClient = new MongoClient(env.MONGODB_URI, { appName: packageJSON.name });

        return ResultAsync.fromPromise(mongoClient.connect(), (error) => {
            if (error instanceof MongoError || error instanceof Error) {
                return error;
            }

            return `An unknown error occured while connecting to db`;
        });
    });
})();
