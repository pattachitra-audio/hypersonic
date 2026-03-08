import { dbClientPromise } from "@/lib/db";
import { AudioBook } from "@/schemas/AudioBook";
import NoThrow from "@/utils/NoThrow";
import { Filter, MongoError, ObjectId, UpdateFilter } from "mongodb";

export type AudioBookDocumentType = AudioBook & {
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

export const AudioBookModelPromise = (async function () {
    const dbClientResult = await dbClientPromise;

    if (dbClientResult.isErr()) {
        return dbClientResult;
    }

    const dbClient = dbClientResult.value;

    const db = dbClient.db("core");
    const collection = db.collection<AudioBookDocumentType>("AudioBook");

    return NoThrow.ok({
        async findAllSummaries() {
            try {
                const result = await collection
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
                    .toArray();
                console.log("result:", result);
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
        async findOneByID(id: ObjectId) {
            try {
                const result = await collection.findOne({ _id: id, status: "ACTIVE" });

                if (!result) {
                    return NoThrow.err(new Error("Data not found"));
                }

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

        async insertOne(document: AudioBookDocumentType) {
            try {
                const result = await collection.insertOne(document);

                /* if (result.acknowledged) {
                    return NoThrow.ok(result.insertedId);
                } */

                return NoThrow.ok(result);
                // return NoThrow.err(new Error("MongoDB 'insertOne' err"));
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

        async replaceOneByID(id: ObjectId, document: AudioBookDocumentType) {
            try {
                const result = await collection.replaceOne({ _id: id }, document);

                /* if (!result.acknowledged) {
                    return NoThrow.err(new Error("Data not found"));
                } */

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

        async updateOne(filter: Filter<AudioBookDocumentType>, updateFilter: UpdateFilter<AudioBookDocumentType>) {
            try {
                const result = await collection.updateOne(filter, updateFilter);

                /* if (!result.acknowledged) {
                    return NoThrow.err(new Error(""))
                } */

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
    });
})();
