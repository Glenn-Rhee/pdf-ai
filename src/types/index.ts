import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "../trpc";
import { JSX } from "react";

export interface ResponsePayload<T = unknown> {
  status: "success" | "failed";
  message: string;
  code: number;
  data: T;
}

type RouterOutput = inferRouterOutputs<AppRouter>;
type Message = RouterOutput["getFileMessages"]["messages"];
type OmitText = Omit<Message[number], "text">;
type ExtendedText = {
  text: string | JSX.Element;
};

export type ExtendedMessage = OmitText & ExtendedText;
