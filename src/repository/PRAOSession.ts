import { dbClientPromise } from "@/lib/db";
import { insertOne } from "@/lib/dbHelpers/insertOne";
import { MongoError, ObjectId } from "mongodb";
import { NoThrow } from "@/utils/NoThrow";

export type PRAOSessionDocumentType = {
    userID: ObjectId;
    accountIDs: string[];
};

/* export type ElevenLabsAccountWithProxySummaryDocumentType = Prettify<
    Omit<ElevenLabsAccountWithProxyDocumentType, "_id" | "password" | "apiKey" | "proxyURL"> & { id: string }
>; */

export const PRAOSessionRepositoryPromise = (async function () {
    const dbClientResult = await dbClientPromise;

    if (dbClientResult.isErr()) {
        console.log("dbClientResultError:", dbClientResult.error);
        return dbClientResult;
    }

    console.log("dbClientResult...");
    const dbClient = dbClientResult.value;
    const db = dbClient.db("core");
    const collection = db.collection<PRAOSessionDocumentType>("PRAOSession");

    return NoThrow.success({
        async findAllByUserID(userID: ObjectId) {
            try {
                const result = await collection.find({ userID }).toArray();

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
        async insertOne(document: PRAOSessionDocumentType) {
            return insertOne(document, collection);
        },
        /* async deleteOneByID(id: ObjectId) {}, */
    });
})();
