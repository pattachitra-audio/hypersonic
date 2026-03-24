import { ObjectId } from "mongodb";

export type Prettify<T extends object, Skip = ObjectId> = {
    [K in keyof T]: T[K] extends object ? (T[K] extends Skip ? T[K] : Prettify<T[K]>) : T[K];
} & {};
