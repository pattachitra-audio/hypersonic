import { tRPCRouter } from "@/server/tRPC";
import { getProcedure } from "./get";

export const praoAllocationsRouter = tRPCRouter({
    get: getProcedure,
});
