import { DBClientResultAsync } from "@/lib/DBClient";
import { handleMongoError } from "@/lib/dbHelpers/handleMongoError";
import { insertOne } from "@/lib/dbHelpers/insertOne";
import { AudioBook } from "@/schemas/AudioBook";
import { Filter, ObjectId, UpdateFilter } from "mongodb";
import { ok, ResultAsync } from "neverthrow";

export type AudioBookDocumentType = AudioBook & {
    allocationID: ObjectId;
    createdAt: Date;
    updatedAt: Date;
    lastAccessedAt: Date;
    status: "ACTIVE" | "ARCHIVED" | "DELETED";
};

export type AudioBookSummaryDocumentType = {
    id: ObjectId;
    name: string;
    plot: string;
    genre: string[];

    numCharacters: number;
    numEpisodes: number;
    numScenes: number;
    numDialogues: number;

    createdAt: Date;
    updatedAt: Date;
    lastAccessedAt: Date;
    status: "ACTIVE" | "ARCHIVED" | "DELETED";
};

export const AudioBookRepositoryResultAsync = DBClientResultAsync.andThen((dbClient) => {
    const db = dbClient.db("core");
    const collection = db.collection<AudioBookDocumentType>("AudioBook");

    return ok({
        findAllSummaries() {
            return ResultAsync.fromPromise(
                collection
                    .aggregate<AudioBookSummaryDocumentType>([
                        {
                            $project: {
                                id: "$_id",
                                _id: 0,
                                name: 1,
                                plot: 1,
                                genre: 1,
                                numCharacters: { $size: "$characters" },
                                numEpisodes: { $size: "$episodes" },
                                numScenes: { $size: "$scenes" },
                                numDialouges: { $size: "$dialogues" },
                                createdAt: 1,
                                updatedAt: 1,
                                lastAccessedAt: 1,
                                status: 1,
                            },
                        },
                    ])
                    .toArray(),
                handleMongoError,
            );
        },
        findOneByID(id: ObjectId) {
            return ResultAsync.fromPromise(collection.findOne({ _id: id, status: "ACTIVE" }), handleMongoError);
        },

        insertOne(document: AudioBookDocumentType) {
            return insertOne(document, collection);
        },

        replaceOneByID(id: ObjectId, document: AudioBookDocumentType) {
            return ResultAsync.fromPromise(collection.replaceOne({ _id: id }, document), handleMongoError);
        },

        updateOne(filter: Filter<AudioBookDocumentType>, updateFilter: UpdateFilter<AudioBookDocumentType>) {
            return ResultAsync.fromPromise(collection.updateOne(filter, updateFilter), handleMongoError);
        },
    });
});
