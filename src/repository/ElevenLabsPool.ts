import { DBClientResultAsync } from "@/lib/DBClient";
import { insertOne } from "@/lib/dbHelpers/insertOne";
import { Prettify } from "@/utils/prettify";
import { ObjectId } from "mongodb";
import { ProxyURLBrand } from "@/brands/proxyURL";
import { ok, ResultAsync } from "neverthrow";
import { handleMongoError } from "@/lib/dbHelpers/handleMongoError";

export type ElevenLabsPoolDocumentType = {
    _id: string;
    proxyURL: ProxyURLBrand;
    ownerID: ObjectId;
    firebaseAuthCreds: {
        refreshToken: string;
    };
    sessionID?: ObjectId;
};

export type ElevenLabsPoolSummaryDocumentType = Prettify<
    Omit<ElevenLabsPoolDocumentType, "_id" | "password" | "proxyURL" | "ownerID"> & { id: string }
>;

export const ElevenLabsPoolRepositoryResultAsync = DBClientResultAsync.andThen((dbClient) => {
    const db = dbClient.db("core");
    const collection = db.collection<ElevenLabsPoolDocumentType>("ElevenLabsAccountWithProxy");

    return ok({
        findAllSummariesByOwnerID(ownerID: ObjectId) {
            return ResultAsync.fromPromise(
                collection
                    .aggregate<ElevenLabsPoolSummaryDocumentType>([
                        { $match: { ownerID } },
                        {
                            $project: {
                                id: "$_id",
                                _id: 0,
                                email: 1,
                                sessionID: 1,
                            },
                        },
                    ])
                    .toArray(),
                handleMongoError,
            );
        },

        findManyByIDs(accountIDs: string[]) {
            return ResultAsync.fromPromise(collection.find({ _id: { $in: accountIDs } }).toArray(), handleMongoError);
        },

        findAllByOwnerID(ownerID: ObjectId) {
            return ResultAsync.fromPromise(collection.find({ ownerID }).toArray(), handleMongoError);
        },

        insertOne(document: ElevenLabsPoolDocumentType) {
            return insertOne(document, collection);
        },

        lockMany(ids: string[], sessionID: ObjectId) {
            return ResultAsync.fromPromise(
                collection.updateMany({ _id: { $in: ids } }, { $set: { sessionID } }),
                handleMongoError,
            );
        },

        unlockMany(ids: string[]) {
            return ResultAsync.fromPromise(
                collection.updateMany({ _id: { $in: ids } }, { $unset: { sessionID: 1 } }),
                handleMongoError,
            );
        },
    });
});
