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
    .query("getByUsername", {
        input: z.object({
            username: z.string(),
        }),
        async resolve({ ctx, input }) {
            const user = await ctx.prisma.user.findUnique({
                where: { username: input.username },
                include: {
                    questions: {
                        include: {
                            tags: true,
                            user: true,
                            votes: true,
                            _count: {
                                select: {
                                    answers: true,
                                    views: true,
                                },
                            },
                        },
                    },
                    answers: {
                        include: {
                            user: true,
                            comments: { include: { user: true } },
                            votes: true,
                            question: {
                                include: {
                                    tags: true,
                                },
                            },
                            _count: {
                                select: {
                                    comments: true,
                                },
                            },
                        },
                    },
                    answerComments: true,
                    questionComments: true,
                },
            });
            if (!user) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }
            return {
                ...user,
                questions: user.questions.map((question) => ({
                    ...question,
                    votesCount: question.votes.reduce((acc, vote) => {
                        return acc + (vote.voteType === VoteType.up ? 1 : -1);
                    }, 0),
                })),
                answers: user.answers.map((answer) => ({
                    ...answer,
                    votesCount: answer.votes.reduce((acc, vote) => {
                        return acc + (vote.voteType === VoteType.up ? 1 : -1);
                    }, 0),
                })),
            };
        },
    });
