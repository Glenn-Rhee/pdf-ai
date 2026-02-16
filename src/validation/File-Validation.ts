import z from "zod";
export default class FileValidation {
  static readonly DELETEFILE = z.object({
    id: z.string({ error: "Please fill id file!" }),
  });
  static readonly GETFILE = z.object({
    key: z.string({ error: "Please fill key file!" }),
  });

  static getCustomPageValidator(numPages: number) {
    return z.object({
      page: z
        .string()
        .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
    });
  }

  static readonly GETFILEUPLOADSTATUS = z.object({
    fileId: z.string({ error: "Please fill file id properly!" }),
  });
}
