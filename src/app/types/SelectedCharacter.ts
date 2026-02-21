import { Character } from "@/schemas/Character";
import { Dialogue } from "@/schemas/Dialogue";

// export type SelectedCharacterFalse = object;
export type SelectedCharacter = { index: number; character: Character; dialogues: Dialogue[] };
// export type SelectedCharacter = SelectedCharacterTrue | SelectedCharacterFalse;
