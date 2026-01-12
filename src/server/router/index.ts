import { tRPCRouter, tRPCProcedure } from "@/server/tRPC";
import z from "zod";
import { projectRouter } from "./project";

export const router = tRPCRouter({
    project: projectRouter,
});

export type Router = typeof router;
