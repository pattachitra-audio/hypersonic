import { DataNotFoundError } from "@/errors/db/DataNotFound";
import { dbClientPromise } from "@/lib/db";
import { handleMongoError } from "@/lib/dbHelpers/handleMongoError";
import { insertOne } from "@/lib/dbHelpers/insertOne";
import { ObjectId } from "mongodb";
import { ok, err, ResultAsync } from "neverthrow";

export type PRAOSessionDocumentType = {
    userID: ObjectId;
    accountIDs: string[];
};

/* export type ElevenLabsAccountWithProxySummaryDocumentType = Prettify<
    Omit<ElevenLabsAccountWithProxyDocumentType, "_id" | "password" | "apiKey" | "proxyURL"> & { id: string }
>; */

export const PRAOSessionRepositoryPromise = (function () {
    return dbClientPromise.andThen((dbClient) => {
        const db = dbClient.db("core");
        const collection = db.collection<PRAOSessionDocumentType>("PRAOSession");

        return ok({
            findAllByUserID(userID: ObjectId) {
                return ResultAsync.fromPromise(collection.find({ userID }).toArray(), handleMongoError);
            },

            findOneByID(id: ObjectId) {
                const filter = { _id: id };
                return ResultAsync.fromPromise(collection.findOne(filter), handleMongoError).andThen((value) => {
                    if (value === null) {
                        return err(new DataNotFoundError<PRAOSessionDocumentType>("core", "PRAOSession", filter));
                    }

                    return ok(value);
                });
            },
            /* async findAllSummaries() {
            try {
                const result = await collection
                    .aggregate<ElevenLabsAccountWithProxySummaryDocumentType>([
                        {
                            $project: {
                                id: "$_id",
                                _id: 0,
                                email: 1,
                            },
                        },
                    ])
                    .toArray();

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
        }, */
            insertOne(document: PRAOSessionDocumentType) {
                return insertOne(document, collection);
            },
            /* async deleteOneByID(id: ObjectId) {}, */
        });
    });
})();
