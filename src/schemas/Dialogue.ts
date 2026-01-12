import z from "zod";

export const DialogueSchema = z.object({
    character: z
        .number()
        .describe(
            "Index reference to the character speaking this dialogue (corresponds to position in characters array)",
        ),
    text: z.string().describe("The actual dialogue text spoken by the character"),
});

export type Dialogue = z.infer<typeof DialogueSchema>;
