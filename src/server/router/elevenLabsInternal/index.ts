import { tRPCRouter } from "@/server/tRPC";
import { sharedVoicesProcedure } from "./sharedVoices";

export const elevenLabsInternalRouter = tRPCRouter({
    sharedVoices: sharedVoicesProcedure,
});
