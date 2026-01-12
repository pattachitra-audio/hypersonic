import { initTRPC } from "@trpc/server";

const tRPC = initTRPC.create();

export const tRPCRouter = tRPC.router;
export const tRPCProcedure = tRPC.procedure;
