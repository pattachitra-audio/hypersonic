import { dbClientPromise } from "@/lib/db";
import { insertOne } from "@/lib/dbHelpers/insertOne";
import { ElevenLabsAccountWithProxy } from "@/schemas/ElevenLabsAccountWithProxy";
import { Prettify } from "@/utils/prettify";
import { MongoError, ObjectId } from "mongodb";
import { NoThrow } from "@/utils/NoThrow";
import { ProxyURLBrand } from "@/brands/proxyURL";

export type ElevenLabsAccountWithProxyDocumentType = Prettify<
    Omit<ElevenLabsAccountWithProxy, "proxy"> & {
        _id: string;
        proxyURL: ProxyURLBrand;
        ownerID: ObjectId;
    }
>;

export type ElevenLabsAccountWithProxySummaryDocumentType = Prettify<
    Omit<ElevenLabsAccountWithProxyDocumentType, "_id" | "password" | "proxyURL" | "ownerID"> & { id: string }
>;

export const ElevenLabsAccountWithProxyRepositoryPromise = (async function () {
    const dbClientResult = await dbClientPromise;

    if (dbClientResult.isErr()) {
        console.log("dbClientResultError:", dbClientResult.error);
        return dbClientResult;
    }

    console.log("dbClientResult");
    const dbClient = dbClientResult.value;
    const db = dbClient.db("core");
    const collection = db.collection<ElevenLabsAccountWithProxyDocumentType>("ElevenLabsAccountWithProxy");

    return NoThrow.success({
        async findAllSummaries() {
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
        },

        async findAllByOwnerID(ownerID: ObjectId) {
            try {
                const result = await collection.find({ ownerID }).toArray();
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

        async insertOne(document: ElevenLabsAccountWithProxyDocumentType) {
            return insertOne(document, collection);
        },
    });
})();
