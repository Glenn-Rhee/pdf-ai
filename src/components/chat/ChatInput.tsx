"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { useContext, useRef } from "react";
import { ChatContext } from "./ChatContext";

interface ChatInputProps {
  isDisabled?: boolean;
}

export default function ChatInput(props: ChatInputProps) {
  const { isDisabled } = props;
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const { addMessage, handleInputChange, isLoading, message } =
    useContext(ChatContext);

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl"
      >
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full grow p-4">
            <div className="relative">
              <Textarea
                ref={textAreaRef}
                autoFocus
                onChange={handleInputChange}
                value={message}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addMessage();
                    textAreaRef.current?.focus();
                    textAreaRef.current!.value = "";
                  }
                }}
                maxRows={4}
                placeholder="Enter your question..."
                className="resize-none text-base pr-12 py-3 scrollbar-thumb-orange scrollbar-thumb-rounded scrollbar-track-orange-lighter scrollbar-w-2 scrolling-touch"
                rows={1}
              />
              <Button
                disabled={message.trim() === "" || isDisabled || isLoading}
                aria-label="send message"
                type="submit"
                onClick={() => {
                  addMessage();
                  textAreaRef.current?.focus();
                  textAreaRef.current!.value = "";
                }}
                className="absolute bottom-1.5 right-2"
              >
                {isLoading ? (
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
