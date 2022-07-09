import { createRouter } from "./context";
import { z } from "zod";
import { Form, Subject, Question, VoteType } from "@prisma/client";
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
  });
