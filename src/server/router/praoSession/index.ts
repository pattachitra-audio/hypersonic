import { tRPCRouter } from "@/server/tRPC";
import { initProcedure } from "./init";

export const praoRouter = tRPCRouter({
    init: initProcedure,
});
