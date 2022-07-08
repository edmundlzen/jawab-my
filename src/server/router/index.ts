// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { questionsRouter } from "./questions";
import { authRouter } from "./auth";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("questions.", questionsRouter)
  .merge("auth.", authRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
