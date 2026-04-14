import { tRPCRouter } from "@/server/tRPC";
import { createProcedure } from "./create";
import { deleteProcedure } from "./delete";
import { getProcedure } from "./get";

export const praoAllocationRouter = tRPCRouter({
    create: createProcedure,
    delete: deleteProcedure,
    get: getProcedure,
});
