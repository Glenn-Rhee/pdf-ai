import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/src/config/infinite-query";
import { useMutation } from "@tanstack/react-query";
import { createContext, useRef, useState } from "react";

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
  const utils = trpc.useUtils();
  const backupMessage = useRef("");
  const { mutate: sendMessage, isPending: isLoading } = useMutation({
    mutationFn: async () => {
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

      return {
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) ?? [],
      };
    },
    // onError: ()
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  const addMessage = () => sendMessage();

  return (
    <ChatContext.Provider
      value={{ addMessage, handleInputChange, isLoading, message }}
    >
      {children}
    </ChatContext.Provider>
  );
};
