import { tRPCRouter } from "@/server/tRPC";
import { initProcedure } from "./init";
import { destroyProcedure } from "./destroy";

export const praoSessionRouter = tRPCRouter({
    init: initProcedure,
    destroy: destroyProcedure,
});
