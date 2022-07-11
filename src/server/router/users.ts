import { createRouter } from "./context";
import { z } from "zod";
import { Form, Subject, VoteType } from "@prisma/client";
import { TRPCError } from "@trpc/server";

// TODO: Add some limits to the query

export const usersRouter = createRouter()
    .middleware(async ({ ctx, next }) => {
        // Any queries or mutations after this middleware will
        // raise an error unless there is a current session
        if (!ctx.session) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        return next();
    })
    .query("getMe", {
        async resolve({ ctx }) {
            return await ctx.prisma.user.findUnique({
                where: { id: ctx.session!.userId as string },
                include: {
                    questions: true,
                    answers: true,
                    answerComments: true,
                    questionComments: true,
                },
            });
        },
    });
