import { dbClientPromise } from "@/lib/db";
import { AudioBook } from "@/schemas/AudioBook";
import NoThrow from "@/utils/NoThrow";
import { MongoError, ObjectId } from "mongodb";

export const AudioBookModelPromise = (async function () {
    const dbClientResult = await dbClientPromise;

    if (dbClientResult.isErr()) {
        return dbClientResult;
    }

    const dbClient = dbClientResult.value;

    const db = dbClient.db("core");
    const collection = db.collection("AudioBook");

    return NoThrow.ok({
        async findOneByID(id: ObjectId) {
            try {
                return NoThrow.ok(await collection.findOne<AudioBook>({ _id: id }));
            } catch (err) {
                if (err instanceof MongoError) {
                    return NoThrow.err(err);
                }

                return NoThrow.err(err as Error);
            }
        },

        async insertOne(audioBook: AudioBook) {
            try {
                const result = await collection.insertOne(audioBook);

                if (result.acknowledged) {
                    return NoThrow.ok(result.insertedId);
                }

                return NoThrow.err(new Error("MongoDB 'insertOne' err"));
            } catch (err) {
                if (err instanceof MongoError) {
                    return NoThrow.err(err);
                }

                return NoThrow.err(err as Error);
            }
        },

        /*
        async updateOneByID(id: ObjectId) {

        },
        */
    });
})();
