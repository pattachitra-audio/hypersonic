import { DataNotFoundError } from "@/errors/db/DataNotFound";
import { DBClientResultAsync } from "@/lib/DBClient";
import { handleMongoError } from "@/lib/dbHelpers/handleMongoError";
import { insertOne } from "@/lib/dbHelpers/insertOne";
import { Filter, ObjectId, WithId } from "mongodb";
import { ok, err, ResultAsync } from "neverthrow";

export type PRAOAllocationDocumentType = {
    userID: ObjectId;
    accountIDs: string[];
};

/* export type ElevenLabsAccountWithProxySummaryDocumentType = Prettify<
    Omit<ElevenLabsAccountWithProxyDocumentType, "_id" | "password" | "apiKey" | "proxyURL"> & { id: string }
>; */

function filterDataNotFoundFactory(filter: Filter<PRAOAllocationDocumentType>) {
    return function filterDataNotFound(document: WithId<PRAOAllocationDocumentType> | null) {
        if (document === null) {
            return err(new DataNotFoundError<PRAOAllocationDocumentType>("core", "PRAOAllocation", filter));
        }

        return ok(document);
    };
}

export const PRAOAllocationRepositoryResultAsync = DBClientResultAsync.andThen((dbClient) => {
    const db = dbClient.db("core");
    const collection = db.collection<PRAOAllocationDocumentType>("PRAOAllocation");

    return ok({
        findAllByUserID(userID: ObjectId) {
            return ResultAsync.fromPromise(collection.find({ userID }).toArray(), handleMongoError);
        },

        findOneByID(id: ObjectId) {
            const filter = { _id: id };

            return ResultAsync.fromPromise(collection.findOne(filter), handleMongoError).andThen(
                filterDataNotFoundFactory(filter),
            );
        },
        deleteOneByID(sessionID: ObjectId) {
            const filter = { _id: sessionID };

            return ResultAsync.fromPromise(collection.findOneAndDelete(filter), handleMongoError).andThen(
                filterDataNotFoundFactory(filter),
            );
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
        insertOne(document: PRAOAllocationDocumentType) {
            return insertOne(document, collection);
        },
        /* async deleteOneByID(id: ObjectId) {}, */
    });
});
