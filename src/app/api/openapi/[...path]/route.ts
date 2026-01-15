import { createOpenApiFetchHandler } from "trpc-to-openapi";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { NextRequest } from "next/server";

const handler = async (req: NextRequest) => {
    return createOpenApiFetchHandler({
        router: appRouter,
        endpoint: "/api/openapi",
        req,
        createContext: async () => {
            return createTRPCContext({
                headers: req.headers,
                req,
            });
        },
    });
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
