import ResponseError from "@/src/error/ResponseError";
import PDFService from "@/src/service/Pdf-Service";
import { ResponsePayload } from "@/src/types";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log("POST ingest");
    const body = (await req.json()) as { fileId: string };
    if (!body.fileId) {
      throw new ResponseError(400, "File id is required!");
    }

    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user) {
      throw new ResponseError(401, "Unathorized!");
    }
    const response = await PDFService.ingestPdf(body.fileId, user.id);
    return NextResponse.json<ResponsePayload>(response);
  } catch (error) {
    if (error instanceof ResponseError) {
      return NextResponse.json<ResponsePayload>({
        code: error.code,
        data: null,
        message: error.message,
        status: "failed",
      });
    }

    return NextResponse.json<ResponsePayload>({
      code: 500,
      data: null,
      message: "Internal server error!",
      status: "failed",
    });
  }
}
