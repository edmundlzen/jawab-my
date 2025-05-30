// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { authRouter } from "./auth";
import { questionsRouter } from "./questions";
import { answersRouter } from "./answers";
import { usersRouter } from "./users";

export const appRouter = createRouter()
    .transformer(superjson)
    .merge("auth.", authRouter)
    .merge("questions.", questionsRouter)
    .merge("answers.", answersRouter)
    .merge("users.", usersRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
