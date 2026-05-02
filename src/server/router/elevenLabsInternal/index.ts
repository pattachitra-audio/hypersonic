import { tRPCRouter } from "@/server/tRPC";
import { sharedVoicesProcedure } from "./sharedVoices";
import { enhanceDialogueProcedure } from "./enhanceDialogue";

export const elevenLabsInternalRouter = tRPCRouter({
    sharedVoices: sharedVoicesProcedure,
    enhanceDialogue: enhanceDialogueProcedure,
});
