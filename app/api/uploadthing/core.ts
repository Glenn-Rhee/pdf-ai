import { prisma } from "@/lib/prisma";
import PDFService from "@/src/service/Pdf-Service";
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
      const createdFile = await prisma.file.create({
        data: {
          key: file.key,
          name: file.name,
          url: file.ufsUrl,
          userId: metadata.userId,
          uploadStatus: "PROCESSING",
        },
      });
      await PDFService.ingestPdf(createdFile.id, createdFile.userId!);
      // console.log(process.env.APP_URL);
      // try {
      //   console.log("Fetching data...");
      //   const res = await fetch(process.env.APP_URL + "/api/ingest", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({ fileId: createdFile.id }),
      //   });
      //   console.log(res.status);
      // } catch (error) {
      //   console.log(error);
      // }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
