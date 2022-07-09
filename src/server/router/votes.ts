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
  .mutation("createQuestionVote", {
    input: z.object({
      questionId: z.string().min(1).max(100),
      voteType: z.nativeEnum(VoteType),
    }),
    async resolve({ ctx, input }) {
      try {
        return await ctx.prisma.questionVote.create({
          data: {
            userId: ctx.session!.userId as string,
            questionId: input.questionId,
            voteType: input.voteType,
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
  .mutation("updateQuestionVoteType", {
    input: z.object({
      questionId: z.string().min(1).max(100),
      voteType: z.nativeEnum(VoteType),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.questionVote.updateMany({
        where: {
          userId: ctx.session!.userId as string,
          questionId: input.questionId,
        },
        data: {
          voteType: input.voteType,
        },
      });
    },
  })
  .mutation("deleteQuestionVote", {
    input: z.object({
      questionId: z.string().min(1).max(100),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.questionVote.deleteMany({
        where: {
          userId: ctx.session!.userId as string,
          questionId: input.questionId,
        },
      });
    },
  });
