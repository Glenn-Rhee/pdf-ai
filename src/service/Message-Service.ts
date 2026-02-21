import z from "zod";
import MessageValidation from "../validation/Message-validation";
import { ResponsePayload } from "../types";
import { prisma } from "@/lib/prisma";
import ResponseError from "../error/ResponseError";
import { createEmbedding as embedQuery } from "../lib/embedding";
import { indexPinecone } from "../lib/pinecone";
import { streamText } from "ai";
import { openai } from "../lib/ai";

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

    const prevMsg = await prisma.message.findMany({
      where: {
        fileId: file.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        isUserMessage: true,
        text: true,
      },
      take: 6,
    });

    const formattedMsgs = prevMsg.map((msg) => ({
      role: msg.isUserMessage ? ("USER" as const) : ("ASSISTANT" as const),
      content: msg.text,
    }));

    const contexts = results.matches.map((m) => m.metadata?.text).join("\n\n");
    const prompt = `
      You are a helpful AI assistant.
      Use the following pieces of context (or previous conversation if needed) to answer the user's question in MARKDOWN format.

      If you don't know the answer, just say that you don't know. Do NOT make up an answer.

      ----------------

      PREVIOUS CONVERSATION:
      ${formattedMsgs.length === 0 ? "No Conversations yet." : formattedMsgs.map((msg) => (msg.role === "USER" ? `User: ${msg.content}` : `Assistant: ${msg.content}`)).join("\n")}

      ----------------

      CONTEXT:
      ${contexts}

      User Input: 
      ${data.message}

      Answear:
    `;
    console.log("Asking ollama...");

    await prisma.message.create({
      data: {
        text: data.message,
        isUserMessage: true,
        userId,
        fileId: data.fileId,
      },
    });

    const response = streamText({
      model: openai("llama3"),
      messages: [{ role: "user", content: prompt }],
      onFinish: async (completion) => {
        await prisma.message.create({
          data: {
            text: completion.text,
            isUserMessage: false,
            fileId: file.id,
            userId,
          },
        });
      },
    });

    const textResponse = await response.toTextStreamResponse().json();

    return {
      code: 200,
      data: {
        response: textResponse,
      },
      message: "Success ask AI",
      status: "success",
    };
  }
}
