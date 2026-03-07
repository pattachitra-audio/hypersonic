import { tRPCRouter } from "@/server/tRPC";
import { projectRouter } from "./project";
import { projectsRouter } from "./projects";

export const router = tRPCRouter({
    project: projectRouter,
    projects: projectsRouter,
});

export type Router = typeof router;
