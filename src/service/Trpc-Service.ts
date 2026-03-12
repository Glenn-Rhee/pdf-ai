import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure } from "../trpc/trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import FileValidation from "../validation/File-Validation";
import { UTApi } from "uploadthing/server";
import { UploadStatus } from "../generated/prisma/enums";
import z from "zod";
import { INFINITE_QUERY_LIMIT } from "../config/infinite-query";
import { indexPinecone } from "../lib/pinecone";
import { absoluteUrl } from "../lib/utils";
import { getUserSubscriptionPlan, stripe } from "../lib/stripe";
import { PLANS } from "../config/stripe";
const utapi = new UTApi();

export default class TrpcService {
  static async authCallback() {
    return publicProcedure.query(async () => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      if (!user?.id || !user.email)
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!dbUser) {
        await prisma.user.create({
          data: { id: user.id, email: user.email },
        });
      }

      return { success: true };
    });
  }

  static async getUserFiles() {
    return privateProcedure.query(async ({ ctx }) => {
      const { userId } = ctx;

      return await prisma.file.findMany({
        where: { userId },
      });
    });
  }

  static async getFile() {
    return privateProcedure
      .input(FileValidation.GETFILE)
      .mutation(async ({ ctx, input }) => {
        const { userId } = ctx;
        const file = await prisma.file.findFirst({
          where: {
            key: input.key,
            userId,
          },
        });

        if (!file) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return file;
      });
  }

  static async deleteFile() {
    return privateProcedure
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
        await utapi.deleteFiles(file.key);
        await indexPinecone.deleteNamespace(file.id);
        await prisma.message.deleteMany({ where: { fileId: file.id } });

        return file;
      });
  }

  static async getFileUploadStatus() {
    return privateProcedure
      .input(FileValidation.GETFILEUPLOADSTATUS)
      .query(async ({ ctx, input }) => {
        const file = await prisma.file.findFirst({
          where: {
            id: input.fileId,
            userId: ctx.userId,
          },
        });

        if (!file) {
          return {
            status: "PENDING" as const,
            progress: 0.0,
          };
        }

        return {
          status: file.uploadStatus as UploadStatus,
          progress: file.progress,
        };
      });
  }

  static async getFileMessages() {
    return privateProcedure
      .input(
        z.object({
          limit: z
            .number({ error: "Input limit properly!" })
            .min(1)
            .max(100)
            .nullish(),
          cursor: z.string({ error: "input cursor properly!" }).nullish(),
          fileId: z.string({ error: "File id is required" }),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { userId } = ctx;
        const { fileId, cursor } = input;
        const limit = input.limit ?? INFINITE_QUERY_LIMIT;
        const file = await prisma.file.findFirst({
          where: {
            id: fileId,
            userId,
          },
        });

        if (!file) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const messages = await prisma.message.findMany({
          where: {
            fileId,
          },
          orderBy: [
            {
              createdAt: "desc",
            },
            {
              id: "desc",
            },
          ],
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          skip: cursor ? 1 : 0,
          select: {
            id: true,
            isUserMessage: true,
            createdAt: true,
            text: true,
          },
        });

        let nextCursor: typeof cursor | undefined = undefined;
        if (messages.length > limit) {
          const nextItem = messages.pop();
          nextCursor = nextItem?.id;
        }

        return {
          messages,
          nextCursor,
        };
      });
  }

  static createStripeSession() {
    return privateProcedure.mutation(async ({ ctx }) => {
      const { userId } = ctx;

      const billingUrl = absoluteUrl("/dashboard/billing");
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const dataUser = await prisma.user.findFirst({
        where: { id: userId },
      });

      if (!dataUser) throw new TRPCError({ code: "UNAUTHORIZED" });

      const subscriiptionPlan = await getUserSubscriptionPlan();

      if (subscriiptionPlan.isSubscribed && dataUser.stripeCustomerId) {
        const stripeSession = await stripe.billingPortal.sessions.create({
          customer: dataUser.stripeCustomerId,
          return_url: billingUrl,
        });

        return { url: stripeSession.url };
      }

      const stripeSession = await stripe.checkout.sessions.create({
        success_url: billingUrl,
        cancel_url: billingUrl,
        payment_method_types: ["card", "paypal"],
        mode: "subscription",
        billing_address_collection: "auto",
        line_items: [
          {
            price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds
              .test,
            quantity: 1,
          },
        ],
        metadata: {
          userId,
        },
      });

      return { url: stripeSession.url };
    });
  }
}
