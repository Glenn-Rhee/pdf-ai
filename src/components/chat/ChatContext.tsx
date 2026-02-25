import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/src/config/infinite-query";
import { useMutation } from "@tanstack/react-query";
import { createContext, useRef, useState } from "react";
import toast from "react-hot-toast";

type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});

interface ChatContextProviderProps {
  fileId: string;
  children: React.ReactNode;
}

export const ChatContextProvider = (props: ChatContextProviderProps) => {
  const { children, fileId } = props;
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const utils = trpc.useUtils();
  const backupMessage = useRef("");
  const { mutate: sendMessage } = useMutation({
    mutationFn: async () => {
      if (message.trim() === "") return;
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.body;
    },
    onMutate: async () => {
      backupMessage.current = message;
      setMessage("");

      // Step 1
      await utils.getFileMessages.cancel();
      // Step 2
      const previousMessages = utils.getFileMessages.getInfiniteData();
      // Step 3
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          const newPages = [...old.pages];
          const latestPage = newPages[0];

          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
            },
            ...latestPage.messages,
          ];

          newPages[0] = latestPage;

          return {
            ...old,
            pages: newPages,
          };
        },
      );

      setIsLoading(true);

      return {
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) ?? [],
      };
    },
    onSuccess: async (stream) => {
      setIsLoading(false);
      if (!stream) {
        return toast.error("No response from server. Please try again.");
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // accumalated response
      let accResponse = "";
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        accResponse += chunkValue;

        // append chunk to the actual message
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINITE_QUERY_LIMIT },
          (old) => {
            if (!old) {
              return {
                pages: [],
                pageParams: [],
              };
            }

            const isAiResponseCreated = old.pages.some((page) =>
              page.messages.some((msg) => msg.id === "ai-response"),
            );

            const updatedPages = old.pages.map((page) => {
              if (page === old.pages[0]) {
                // if ai response is not created, create a placeholder message for it
                let updatedMessage;
                if (!isAiResponseCreated) {
                  updatedMessage = [
                    {
                      createdAt: new Date().toISOString(),
                      id: "ai-response",
                      text: accResponse,
                      isUserMessage: false,
                    },
                    ...page.messages,
                  ];
                } else {
                  updatedMessage = page.messages.map((msg) => {
                    if (msg.id === "ai-response") {
                      return {
                        ...msg,
                        text: accResponse,
                      };
                    }
                    return msg;
                  });
                }
                return {
                  ...page,
                  messages: updatedMessage,
                };
              }

              return page;
            });

            return {
              ...old,
              pages: updatedPages,
            };
          },
        );
      }
    },
    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] },
      );
    },
    onSettled: async () => {
      setIsLoading(false);
      await utils.getFileMessages.invalidate({ fileId });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  const addMessage = () => {
    setMessage("");
    sendMessage();
  };

  return (
    <ChatContext.Provider
      value={{ addMessage, handleInputChange, isLoading, message }}
    >
      {children}
    </ChatContext.Provider>
  );
};
