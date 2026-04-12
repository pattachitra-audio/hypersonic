import { tRPCRouter } from "@/server/tRPC";
import { initProcedure } from "./init";
import { destroyProcedure } from "./destroy";

export const praoAllocationRouter = tRPCRouter({
    init: initProcedure,
    destroy: destroyProcedure,
});
