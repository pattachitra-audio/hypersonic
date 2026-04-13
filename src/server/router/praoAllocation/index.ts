import { tRPCRouter } from "@/server/tRPC";
import { createProcedure } from "./create";
import { deleteProcedure } from "./delete";

export const praoAllocationRouter = tRPCRouter({
    create: createProcedure,
    delete: deleteProcedure,
});
