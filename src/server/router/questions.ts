import { createRouter } from "./context";
import { z } from "zod";
import { Form, Subject } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const questionsRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.question.findMany();
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
      console.log(ctx.session);
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
