export type Prettify<T extends object> = {
    [K in keyof T]: T[K] extends object ? Prettify<T[K]> : T[K];
} & {};
