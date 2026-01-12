import z from "zod";
import { CharacterSchema } from "./Character";
import { SceneSchema } from "./Scene";
import { DialogueSchema } from "./Dialogue";
import { EpisodeSchema } from "./Episode";

export const AudioBookSchema = z
    .object({
        characters: z.array(CharacterSchema).describe("List of all characters appearing in the audiobook"),
        episodes: z.array(EpisodeSchema).describe("List of episodes that structure the audiobook content"),
        scenes: z.array(SceneSchema).describe("List of scenes that make up the audiobook narrative"),
        dialogues: z.array(DialogueSchema).describe("Sequential list of all dialogue lines in the audiobook"),
    })
    .superRefine((data, ctx) => {
        const numCharacters = data.characters.length;

        /* Validate character indices in dialogues */
        data.dialogues.forEach((dialogue, i) => {
            if (dialogue.character < 0 || dialogue.character >= numCharacters) {
                ctx.addIssue({
                    code: "custom",
                    message: `'dialogue' at index ${i} references invalid 'character' index ${dialogue.character}; Valid range: [0, ${numCharacters})`,
                    path: ["dialogues", i, "character"],
                });
            }
        });

        /* Validate scene's dialogue indices are continuous */
        for (let i = 0; i < data.scenes.length - 1; i++) {
            const curr = data.scenes[i];
            const next = data.scenes[i + 1];

            if (curr.dialogueEnd !== next.dialogueBegin) {
                ctx.addIssue({
                    code: "custom",
                    message: `'scene' at index ${i} ends at 'dialogue' index ${curr.dialogueEnd} but it's next 'scene' at index ${i + 1} begins at 'dialogue' index ${next.dialogueBegin}; They should be equal`,
                    path: ["scenes", i + 1, "dialogueBegin"],
                });
            }
        }

        /* Validate scene dialogue indices are within bounds */
        {
            const firstScene = data.scenes.at(0);

            const lastScene = data.scenes.at(-1);
        }

        /* TODO: finish these */
    });

export type AudioBook = z.infer<typeof AudioBookSchema>;
