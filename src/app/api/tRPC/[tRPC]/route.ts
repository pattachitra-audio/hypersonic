import { router } from "@/server/router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request) => {
    console.log("Request URL:", req.url);

    return fetchRequestHandler({
        endpoint: "/api/tRPC",
        req,
        router,
        createContext: () => ({}),
        onError: ({ error, path, input }) => {
            console.log("=== tRPC Error ===");
            console.log("Path:", path);
            console.log("Input:", input);
            console.log("Error message:", error.message);
            console.log("Error stack:", error.stack);
            console.log("Error cause:", error.cause);
        },
    });
};

export { handler as GET, handler as POST };
