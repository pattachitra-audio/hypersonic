import z from "zod";

export type ResponseType = {
    generationInfo: string;
    historyItemID: string;
    requestID: string;
    cost: number;
    regenerationCount: number;

    buffer: ArrayBuffer;
};

export const ResponseMetadataSchema = z.object({
    generationInfo: z.string(),
    historyItemID: z.string(),
    requestID: z.string(),
    cost: z.coerce.number().int(),
    regenerationCount: z.coerce.number().int(),
});
