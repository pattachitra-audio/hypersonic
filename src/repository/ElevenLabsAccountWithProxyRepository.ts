import { dbClientPromise } from "@/lib/db";
import { insertOne } from "@/lib/dbHelpers/insertOne";
import { ElevenLabsAccountWithProxy } from "@/schemas/ElevenLabsAccountWithProxy";
import { ProxyURLType } from "@/types/proxyURL";
import { Prettify } from "@/utils/prettify";
import { MongoError } from "mongodb";
import NoThrow from "@/utils/NoThrow";

export type ElevenLabsAccountWithProxyDocumentType = Omit<ElevenLabsAccountWithProxy, "proxy" | "userID"> & {
    _id: string;
    proxyURL: ProxyURLType;
};

export type ElevenLabsAccountWithProxySummaryDocumentType = Prettify<
    Omit<ElevenLabsAccountWithProxyDocumentType, "_id" | "password" | "apiKey" | "proxyURL"> & { id: string }
>;

export const ElevenLabsAccountWithProxyRepositoryPromise = (async function () {
    const dbClientResult = await dbClientPromise;

    if (dbClientResult.isErr()) {
        console.log("dbClientResultError:", dbClientResult.error);
        return dbClientResult;
    }

    console.log("dbClientResult...");
    const dbClient = dbClientResult.value;
    const db = dbClient.db("core");
    const collection = db.collection<ElevenLabsAccountWithProxyDocumentType>("ElevenLabsAccountWithProxy");

    return NoThrow.ok({
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
        },

        async insertOne(document: ElevenLabsAccountWithProxyDocumentType) {
            return insertOne(document, collection);
        },
    });
})();
