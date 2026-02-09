import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({
    pdf: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({}) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();
      if (!user || !user.id) throw new UploadThingError({ code: "FORBIDDEN" });

      return { userId: user.id };
    })
    .onUploadError((inputErr) => {
      console.log(inputErr.error);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.file.create({
        data: {
          key: file.key,
          name: file.name,
          url: file.ufsUrl,
          userId: metadata.userId,
          uploadStatus: "PROCESSING",
        },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
