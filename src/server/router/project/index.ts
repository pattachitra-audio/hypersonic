import { tRPCRouter } from "@/server/tRPC";
import { createProcedure } from "./create";
import { updateProcedure } from "./update";
import { getProcedure } from "./get";
import { archiveProcedure } from "./archive";
import { deleteProcedure } from "./delete";

export const projectRouter = tRPCRouter({
    create: createProcedure,
    get: getProcedure,
    update: updateProcedure,
    archive: archiveProcedure,
    delete: deleteProcedure,
});
