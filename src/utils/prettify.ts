import { ObjectId } from "mongodb";

type GlobalSkip = ObjectId;

export type Prettify<T extends object, Skip = never> = {
    [K in keyof T]: T[K] extends infer X extends object ? (X extends Skip | GlobalSkip ? X : Prettify<X>) : T[K];
} & {};
