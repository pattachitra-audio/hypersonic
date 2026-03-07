import { dbClientPromise } from "@/lib/db";
import { AudioBook } from "@/schemas/AudioBook";
import NoThrow from "@/utils/NoThrow";
import { MongoError, ObjectId } from "mongodb";

export type AudioBookDocumentType = AudioBook & {
    createdAt: Date;
    updatedAt: Date;
    status: "ACTIVE" | "ARCHIVED" | "DELETED";
};

export type AudioBookSummaryType = {
    name: string;
    plot: string;
    genre: string[];

    numCharacters: number;
    numEpisodes: number;
    numScenes: number;
    numDialogues: number;

    createdAt: Date;
    updatedAt: Date;
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
                    .aggregate<AudioBookSummaryType>([
                        {
                            $project: {
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
                                status: 1,
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
        async findOneByID(id: ObjectId) {
            try {
                const result = await collection.findOne({ _id: id });

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

                if (result.acknowledged) {
                    return NoThrow.ok(result.insertedId);
                }

                return NoThrow.err(new Error("MongoDB 'insertOne' err"));
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

        async updateOneByID(id: ObjectId, document: AudioBookDocumentType) {
            try {
                const result = await collection.updateOne({ _id: id }, document);

                if (!result.acknowledged) {
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
    });
})();
