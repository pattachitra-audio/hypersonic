import { Character } from "@/schemas/Character";
import { Dialogue } from "@/schemas/Dialogue";

// export type SelectedCharacterFalse = object;
export type SelectedCharacterType = { index: number; character: Character; dialogues: Dialogue[] };
// export type SelectedCharacterType = SelectedCharacterTrue | SelectedCharacterFalse;
