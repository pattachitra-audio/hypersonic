import { tRPCRouter } from "@/server/tRPC";
import { projectRouter } from "./project";
import { projectsRouter } from "./projects";
import { elevenLabsPoolRouter } from "./elevenLabsPool";
import { elevenLabsInternalRouter } from "./elevenLabsInternal";
import { praoAllocationRouter } from "./praoAllocation";
import { praoAllocationsRouter } from "./praoAllocations";

export const router = tRPCRouter({
    project: projectRouter,
    projects: projectsRouter,
    elevenLabsPool: elevenLabsPoolRouter,
    praoAllocation: praoAllocationRouter,
    praoAllocations: praoAllocationsRouter,
    elevenLabsInternal: elevenLabsInternalRouter,
});

export type Router = typeof router;
