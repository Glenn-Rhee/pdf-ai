import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  isDisabled?: boolean;
}
export default function ChatInput(props: ChatInputProps) {
  const { isDisabled } = props;

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <form className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full grow p-4">
            <div className="relative">
              <Textarea
                autoFocus
                maxRows={4}
                placeholder="Enter your question..."
                className="resize-none text-base pr-12 py-3 scrollbar-thumb-orange scrollbar-thumb-rounded scrollbar-track-orange-lighter scrollbar-w-2 scrolling-touch"
                rows={1}
              />
              <Button
                aria-label="send message"
                className="absolute bottom-1.5 right-2"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
