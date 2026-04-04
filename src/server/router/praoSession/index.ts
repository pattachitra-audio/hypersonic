import { tRPCRouter } from "@/server/tRPC";
import { initProcedure } from "./init";

export const praoSessionRouter = tRPCRouter({
    init: initProcedure,
});
