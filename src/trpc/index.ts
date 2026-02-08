import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import FileValidation from "../validation/File-Validation";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" });
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      await prisma.user.create({
        data: { id: user.id, email: user.email },
      });
    }

    return { success: true };
  }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await prisma.file.findMany({
      where: { userId },
    });
  }),
  deleteFile: privateProcedure
    .input(FileValidation.DELETEFILE)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const file = await prisma.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await prisma.file.delete({ where: { id: input.id, userId } });

      return file;
    }),
});

export type AppRouter = typeof appRouter;
