import { Filter } from "mongodb";

export class DataNotFoundError<Doc> extends Error {
    constructor(db: string, collection: string, filter: Filter<Doc>) {
        super(`No document matching filter ${JSON.stringify(filter)} found in ${db}.${collection}`);
        this.name = "DataNotFoundError";
    }
}
