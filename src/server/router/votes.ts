import { createRouter } from "./context";
import { z } from "zod";
import { VoteType, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const votesRouter = createRouter()
    .middleware(async ({ ctx, next }) => {
        // Any queries or mutations after this middleware will
        // raise an error unless there is a current session
        if (!ctx.session) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        return next();
    })
    .mutation("question", {
        input: z.object({
            questionId: z.string().min(1).max(100),
            voteType: z.nativeEnum(VoteType),
            remove: z.boolean().optional(),
        }),
        async resolve({ ctx, input }) {
            const { questionId, voteType, remove } = input;
            const userId = ctx.session!.userId as string;

            const question = await ctx.prisma.question.findUnique({
                where: { id: questionId },
            });

            if (!question) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            const vote = await ctx.prisma.questionVote.findMany({
                where: {
                    questionId,
                    userId,
                },
            });

            if (vote.length > 0) {
                if (remove) {
                    await ctx.prisma.questionVote.deleteMany({
                        where: {
                            questionId,
                            userId,
                        },
                    });
                } else {
                    await ctx.prisma.questionVote.updateMany({
                        where: {
                            questionId,
                            userId,
                        },
                        data: {
                            voteType,
                        },
                    });
                }
            } else {
                await ctx.prisma.questionVote.create({
                    data: {
                        questionId,
                        userId,
                        voteType,
                    },
                });
            }
        },
    })
    .mutation("answer", {
        input: z.object({
            answerId: z.string().min(1).max(100),
            voteType: z.nativeEnum(VoteType),
            remove: z.boolean().optional(),
        }),
        async resolve({ ctx, input }) {
            const { answerId, voteType, remove } = input;
            const userId = ctx.session!.userId as string;

            const answer = await ctx.prisma.answer.findUnique({
                where: { id: answerId },
            });

            if (!answer) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            const vote = await ctx.prisma.answerVote.findMany({
                where: {
                    answerId,
                    userId,
                },
            });

            if (vote.length > 0) {
                if (remove) {
                    await ctx.prisma.answerVote.deleteMany({
                        where: {
                            answerId,
                            userId,
                        },
                    });
                } else {
                    await ctx.prisma.answerVote.updateMany({
                        where: {
                            answerId,
                            userId,
                        },
                        data: {
                            voteType,
                        },
                    });
                }
            } else {
                await ctx.prisma.answerVote.create({
                    data: {
                        answerId,
                        userId,
                        voteType,
                    },
                });
            }
        },
    });
