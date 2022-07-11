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
                include: { votes: true, user: true, comments: { include: { user: true } } },
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
    })
    .mutation("delete", {
        input: z.object({
            answerId: z.string(),
        }),
        async resolve({ ctx, input }) {
            const answer = await ctx.prisma.answer.findUnique({
                where: { id: input.answerId },
            });

            if (!answer) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            if (answer.userId !== ctx.session!.userId) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            return ctx.prisma.answer.delete({
                where: { id: input.answerId },
            });
        },
    })
    .mutation("vote", {
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
