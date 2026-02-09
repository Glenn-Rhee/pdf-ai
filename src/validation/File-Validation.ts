import z from "zod";
export default class FileValidation {
  static readonly DELETEFILE = z.object({
    id: z.string({ error: "Please fill id file!" }),
  });
  static readonly GETFILE = z.object({
    key: z.string({ error: "Please fill key file!" }),
  });
}
