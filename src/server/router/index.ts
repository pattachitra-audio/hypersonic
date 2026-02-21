import { tRPCRouter } from "@/server/tRPC";
import { projectRouter } from "./project";

export const router = tRPCRouter({
    project: projectRouter,
});

export type Router = typeof router;
