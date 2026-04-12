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
        deleteOneByID(allocationID: ObjectId) {
            const filter = { _id: allocationID };

            return ResultAsync.fromPromise(collection.findOneAndDelete(filter), handleMongoError).andThen(
                filterDataNotFoundFactory(filter),
            );
        },
        insertOne(document: PRAOAllocationDocumentType) {
            return insertOne(document, collection);
        },
    });
});
