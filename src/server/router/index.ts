// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { authRouter } from "./auth";
import { questionsRouter } from "./questions";
import { votesRouter } from "./votes";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("auth.", authRouter)
  .merge("questions.", questionsRouter)
  .merge("votes.", votesRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
