import z from "zod";

export const SceneSchema = z.object({
    name: z.string().max(128).describe("Name or title of the scene (maximum 128 characters)"),
    description: z.string().describe("Detailed description of what happens in this scene"),
    time: z.string().describe("Temporal setting of the scene (e.g., 'morning', 'night', 'dawn', specific time)"),
    location: z.string().describe("Physical location or setting where the scene takes place"),
    dialogueBegin: z.number().describe("Starting dialogue index for this scene (inclusive)"),
    dialogueEnd: z.number().describe("Ending dialogue index for this scene (exclusive)"),
});

export type Scene = z.infer<typeof SceneSchema>;
