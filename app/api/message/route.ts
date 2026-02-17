import ResponseError from "@/src/error/ResponseError";
import MessageService from "@/src/service/Message-Service";
import { ResponsePayload } from "@/src/types";
import MessageValidation from "@/src/validation/Message-validation";
import Validation from "@/src/validation/Validation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();

  try {
    const { getUser } = getKindeServerSession();

    const user = await getUser();
    if (!user?.id) {
      throw new ResponseError(401, "Unathorized");
    }

    const data = Validation.validate(MessageValidation.SENDMESSAGE, body);
    const res = await MessageService.sendMessage(data, user.id);
    return NextResponse.json<ResponsePayload>(res);
  } catch (error) {
    if (error instanceof ResponseError) {
      return NextResponse.json<ResponsePayload>({
        message: error.message,
        code: error.code,
        status: "failed",
        data: null,
      });
    } else if (error instanceof ZodError) {
      return NextResponse.json<ResponsePayload>({
        status: "failed",
        code: 400,
        data: null,
        message: error.issues[0].message,
      });
    } else {
      return NextResponse.json<ResponsePayload>({
        status: "failed",
        code: 500,
        data: null,
        message: "Internal server error!",
      });
    }
  }
}
