import z from "zod";
import MessageValidation from "../validation/Message-validation";
import { ResponsePayload } from "../types";
import { prisma } from "@/lib/prisma";
import ResponseError from "../error/ResponseError";
import { createEmbedding as embedQuery } from "../lib/embedding";
import { indexPinecone } from "../lib/pinecone";
import ollama from "ollama";

export default class MessageService {
  static async sendMessage(
    data: z.infer<typeof MessageValidation.SENDMESSAGE>,
    userId: string,
  ): Promise<ResponsePayload> {
    const file = await prisma.file.findFirst({
      where: {
        id: data.fileId,
        userId,
      },
    });

    if (!file) {
      throw new ResponseError(404, "File not found!");
    }

    console.log("Embedding query...");
    const queryEmbedding = await embedQuery(data.message);
    console.log("Query to pinecone...");
    const results = await indexPinecone.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    });

    const contexts = results.matches.map((m) => m.metadata?.text).join("\n\n");
    const prompt = `
      Kamu adalah AI asisten dan hanya boleh menjawab berdasarkan context yang sudah saya berikan.
      Oiya jawaban yang anda berikan tidak perlu mention prompt yang ini. Jika anda ingin mention prompt
      mention pertanyaan dari user saja. 

      Apabila user bertanya tentang siapa anda, anda dapat menjawab:
      "Saya adalah Glenn AI, saya bertugas membantu anda mengenai PDF yang anda upload."

      Apabila jawaban tidak ada di dalam context, katakan:
      "Saya tidak dapat menemukan jawaban berdasarkan pertanyaan tersebut, di document."

      Apabila terdapat user yang meminta rangkuman/ringkasan, anda dapat membuatkannya.

      Context:
      ${contexts}

      Pertanyaan:
      ${data.message}
    `;
    console.log("Asking ollama...");
    const response = await ollama.generate({
      model: "llama3",
      prompt,
      stream: false,
    });
    console.log("response from llama3");
    console.log(response.response);
    await prisma.message.create({
      data: {
        text: data.message,
        isUserMessage: true,
        userId,
        fileId: data.fileId,
      },
    });

    await prisma.message.create({
      data: {
        text: response.response,
        isUserMessage: false,
        userId,
        fileId: data.fileId,
      },
    });

    return {
      code: 200,
      data: {
        response: response.response,
      },
      message: "Success ask AI",
      status: "success",
    };
  }
}
