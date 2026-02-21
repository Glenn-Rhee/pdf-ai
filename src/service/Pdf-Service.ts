import { prisma } from "@/lib/prisma";
import { ResponsePayload } from "../types";
import ResponseError from "../error/ResponseError";
import { parsePDF } from "../lib/ingest";
import { splitText } from "../lib/chunk";
import { createEmbedding } from "../lib/embedding";
import { indexPinecone } from "../lib/pinecone";

export default class PDFService {
  static async ingestPdf(
    fileId: string,
    userId: string,
  ): Promise<ResponsePayload> {
    const file = await prisma.file.findFirst({
      where: { id: fileId, userId },
      select: { id: true, url: true },
    });
    if (!file) {
      throw new ResponseError(404, "File is not found!");
    }
    console.log("Fetching file pdf...");
    const res = await fetch(file.url);
    const buffer = Buffer.from(await res.arrayBuffer());
    console.log("Parsing pdf...");
    const text = await parsePDF(buffer);
    const chunks = splitText(text, 400);

    const vectors = [];
    console.log("Processing embeding...", chunks.length);
    try {
      for (let i = 0; i < chunks.length; i++) {
        console.log("Embedding", i);
        const embedding = await createEmbedding(chunks[i]);
        vectors.push({
          id: `${file.id}-${i}`,
          values: embedding,
          metadata: { text: chunks[i], fileId: file.id },
        });

        if (vectors.length === 50) {
          await indexPinecone.upsert({ records: vectors });
          vectors.length = 0;
        }
      } 
      console.log("processed embedding:", vectors);
      if (vectors.length) {
        await indexPinecone.upsert({ records: vectors });
      }

      await prisma.file.update({
        where: { id: file.id },
        data: { uploadStatus: "SUCCESS" },
      });

      return {
        code: 201,
        data: null,
        message: "Success",
        status: "success",
      };
    } catch (error) {
      console.log("Error embedding file:", error);
      await prisma.file.update({
        where: { id: file.id },
        data: { uploadStatus: "FAILED" },
      });

      throw new ResponseError(500, "Error embedding file.");
    }
  }
}
