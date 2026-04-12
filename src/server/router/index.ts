import { tRPCRouter } from "@/server/tRPC";
import { projectRouter } from "./project";
import { projectsRouter } from "./projects";
import { elevenLabsPoolRouter } from "./elevenLabsPool";
import { praoSessionRouter } from "./praoSession";
import { elevenLabsInternalRouter } from "./elevenLabsInternal";

export const router = tRPCRouter({
    project: projectRouter,
    projects: projectsRouter,
    elevenLabsPool: elevenLabsPoolRouter,
    praoSession: praoSessionRouter,
    elevenLabsInternal: elevenLabsInternalRouter,
});

export type Router = typeof router;
