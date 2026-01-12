import { dbClientPromise } from "@/lib/db";
import { AudioBook } from "@/schemas/AudioBook";
import { MongoError, ObjectId } from "mongodb";
import NoThrow from "neverthrow";

export const AudioBookModelPromise = (async function () {
    const dbClientResult = await dbClientPromise;

    if (dbClientResult.isErr()) {
        return dbClientResult;
    }

    const dbClient = dbClientResult.value;

    const db = dbClient.db("core");
    const collection = db.collection("AudioBook");

    return new NoThrow.Ok({
        async findOneByID(id: ObjectId) {
            try {
                return new NoThrow.Ok(await collection.findOne({ _id: id }));
            } catch (err) {
                if (err instanceof MongoError) {
                    return new NoThrow.Err(err);
                }

                return new NoThrow.Err(err as Error);
            }
        },

        async insertOne(audioBook: AudioBook) {
            try {
                const result = await collection.insertOne(audioBook);

                if (result.acknowledged) {
                    return new NoThrow.Ok(result.insertedId);
                }

                return new NoThrow.Err(new Error("MongoDB 'insertOne' err"));
            } catch (err) {
                if (err instanceof MongoError) {
                    return new NoThrow.Err(err);
                }

                return new NoThrow.Err(err as Error);
            }
        },

        /*
        async updateOneByID(id: ObjectId) {

        },
        */
    });
})();
