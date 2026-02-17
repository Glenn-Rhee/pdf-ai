import z from "zod";

export default class MessageValidation {
  static readonly SENDMESSAGE = z.object({
    fileId: z.string({ error: "Please fill file id properly!" }),
    message: z.string({ error: "Please fill message properly" }).trim(),
  });
}
