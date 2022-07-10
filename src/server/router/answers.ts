import { createRouter } from "./context";
import { z } from "zod";
import { VoteType, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const answersRouter = createRouter()
    .query("getAllForQuestion", {
        input: z.object({
            questionId: z.string(),
        }),
        async resolve({ ctx, input }) {
            const answers = await ctx.prisma.answer.findMany({
                include: { votes: true, user: true },
            });
            return answers.map((answer) => ({
                ...answer,
                votesCount: answer.votes.reduce((acc, vote) => {
                    return acc + (vote.voteType === VoteType.up ? 1 : -1);
                }, 0),
            }));
        },
    })
    .middleware(async ({ ctx, next }) => {
        // Any queries or mutations after this middleware will
        // raise an error unless there is a current session
        if (!ctx.session) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        return next();
    })
    .mutation("create", {
        input: z.object({
            questionId: z.string(),
            content: z.string(),
        }),
        async resolve({ ctx, input }) {
            try {
                return await ctx.prisma.answer.create({
                    data: {
                        ...input,
                        userId: ctx.session!.userId as string,
                    },
                });
            } catch (e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError) {
                    if (e.code === "P2002") {
                        throw new TRPCError({ code: "BAD_REQUEST" });
                    }
                }
            }
        },
    });
