import { tRPCRouter } from "@/server/tRPC";
import { createProcedure } from "./create";
import { destroyProcedure } from "./destroy";

export const praoAllocationRouter = tRPCRouter({
    create: createProcedure,
    destroy: destroyProcedure,
});
