"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ResponseError from "@/src/error/ResponseError";
import { ResponsePayload } from "@/src/types";
import MessageValidation from "@/src/validation/Message-validation";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

interface ChatInputProps {
  isDisabled?: boolean;
  fileId: string;
}

export default function ChatInput(props: ChatInputProps) {
  const { isDisabled, fileId } = props;
  type TMessage = z.infer<typeof MessageValidation.SENDMESSAGE>;
  const { register, handleSubmit, watch, setValue } = useForm<TMessage>({
    defaultValues: {
      fileId,
      message: "",
    },
  });
  const [loading, setLoading] = useState<boolean>(false);

  const msg = watch("message") ?? "";

  async function handleSendMessage(data: TMessage) {
    setValue("message", "");
    setLoading(true);
    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const resData = (await res.json()) as ResponsePayload;
      if (resData.status === "failed") {
        throw new ResponseError(resData.code, resData.message);
      }
    } catch (error) {
      if (error instanceof ResponseError) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(handleSendMessage)();
        }}
        className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl"
      >
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full grow p-4">
            <div className="relative">
              <Textarea
                {...register("message")}
                autoFocus
                maxRows={4}
                placeholder="Enter your question..."
                className="resize-none text-base pr-12 py-3 scrollbar-thumb-orange scrollbar-thumb-rounded scrollbar-track-orange-lighter scrollbar-w-2 scrolling-touch"
                rows={1}
              />
              <Button
                disabled={msg.trim() === "" || isDisabled}
                aria-label="send message"
                className="absolute bottom-1.5 right-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
