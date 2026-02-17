import z from "zod";
import MessageValidation from "../validation/Message-validation";
import { ResponsePayload } from "../types";
import { prisma } from "@/lib/prisma";
import ResponseError from "../error/ResponseError";

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

    await prisma.message.create({
      data: {
        text: data.message,
        isUserMessage: true,
        userId,
        fileId: data.fileId,
      },
    });

    
  }
}
