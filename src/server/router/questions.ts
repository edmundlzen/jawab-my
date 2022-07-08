import { createRouter } from "./context";
import { z } from "zod";

export const questionsRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.question.findMany();
    },
});
