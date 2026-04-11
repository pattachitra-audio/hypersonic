import { tRPCRouter } from "@/server/tRPC";
import { addProcedure } from "./add";
import { getProcedure } from "./get";

export const elevenLabsAccountWithProxyRouter = tRPCRouter({
    add: addProcedure,
    get: getProcedure,
});
