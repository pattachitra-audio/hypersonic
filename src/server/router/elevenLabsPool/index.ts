import { tRPCRouter } from "@/server/tRPC";
import { addProcedure } from "./add";
import { getProcedure } from "./get";

export const elevenLabsPoolRouter = tRPCRouter({
    add: addProcedure,
    get: getProcedure,
});
