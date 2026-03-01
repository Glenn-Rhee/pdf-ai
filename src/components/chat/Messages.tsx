import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/src/config/infinite-query";
import { MessagesSquareIcon } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Message from "./Message";
import { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "./ChatContext";
import { cn } from "@/lib/utils";
import { useIntersection } from "@mantine/hooks";

interface MessagesProps {
  fileId: string;
}

export default function Messages(props: MessagesProps) {
  const { fileId } = props;
  const { isLoading: isAiThinking } = useContext(ChatContext);
  const { data, isLoading, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      {
        fileId,
        limit: INFINITE_QUERY_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );
  const messages = data?.pages.flatMap((page) => page.messages);
  const loadingMessage = {
    createdAt: new Date().toISOString(),
    id: "loading-message",
    isUserMessage: false,
    text: (
      <div className="flex items-center gap-x-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 animate-pulse rounded-full bg-orange-500 border border-orange-600",
              `delay-${i * 200}`,
            )}
          />
        ))}
      </div>
    ),
  };
  const combinedMessages = [
    ...(isAiThinking ? [loadingMessage] : []),
    ...(messages ?? []),
  ];

  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setRoot(lastMessageRef.current);
  }, []);

  const { ref, entry } = useIntersection({
    root,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-orange scrollbar-thumb-rounded scrollbar-track-orange-lighter scrollbar-w-2 scrolling-touch">
      {combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((msg, i) => {
          const isNextMsgSamePerson =
            combinedMessages[i - 1]?.isUserMessage ===
            combinedMessages[i].isUserMessage;

          if (i == combinedMessages.length - 1) {
            return (
              <Message
                ref={ref}
                isNextMessageSamePerson={isNextMsgSamePerson}
                message={msg}
                key={msg.id}
              />
            );
          }
          return (
            <Message
              isNextMessageSamePerson={isNextMsgSamePerson}
              message={msg}
              key={msg.id}
            />
          );
        })
      ) : isLoading ? (
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessagesSquareIcon className="h-8 w-8 text-orange-500" />
          <h3 className="font-semibold text-xl">You&apos;re all set!</h3>
          <p className="text-zinc-500 text-sm">
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  );
}
