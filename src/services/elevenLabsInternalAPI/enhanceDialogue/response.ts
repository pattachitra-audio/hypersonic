import z from "zod";

export const ResponseSchema = z
    .object({
        enhanced: z.boolean(),
        enhanced_blocks: z.array(z.string()),
    })
    .transform(({ enhanced_blocks: enhancedBlocks, ...rest }) => ({ ...rest, enhancedBlocks }));
