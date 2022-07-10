import { createRouter } from "./context";
import { z } from "zod";
import { Form, Subject, VoteType } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const questionsRouter = createRouter()
    .query("getAll", {
        async resolve({ ctx }) {
            const questions = await ctx.prisma.question.findMany({
                include: { votes: true, tags: true, user: true },
            });
            return questions.map((question) => ({
                ...question,
                votesCount: question.votes.reduce((acc, vote) => {
                    return acc + (vote.voteType === VoteType.up ? 1 : -1);
                }, 0),
            }));
        },
    })
    .query("getById", {
        input: z.object({
            questionId: z.string(),
        }),
        async resolve({ ctx, input }) {
            const question = await ctx.prisma.question.findUnique({
                where: { id: input.questionId },
                include: {
                    votes: true,
                    tags: true,
                    user: true,
                    answers: { include: { votes: true, user: true } },
                },
            });
            if (!question) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }
            return {
                ...question,
                votesCount: question.votes.reduce((acc, vote) => {
                    return acc + (vote.voteType === VoteType.up ? 1 : -1);
                }, 0),
                answers: question.answers.map((answer) => ({
                    ...answer,
                    votesCount: answer.votes.reduce((acc, vote) => {
                        return acc + (vote.voteType === VoteType.up ? 1 : -1);
                    }, 0),
                })),
            };
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
            subject: z.nativeEnum(Subject),
            form: z.nativeEnum(Form),
            title: z.string().min(10).max(100),
            content: z.string().min(10).max(1000),
            tags: z.array(z.string().min(1).max(30)).max(5),
        }),
        async resolve({ ctx, input }) {
            return await ctx.prisma.question.create({
                data: {
                    subject: input.subject,
                    form: input.form,
                    title: input.title,
                    content: input.content,
                    userId: ctx.session!.userId as string,
                    // Create a new tag if it doesn't exist
                    tags: {
                        connectOrCreate: input.tags.map((tag) => ({
                            where: {
                                name: tag,
                            },
                            create: {
                                name: tag,
                            },
                        })),
                    },
                },
            });
        },
    })
    .mutation("vote", {
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
    });
