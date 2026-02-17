import { useMutation } from "@tanstack/react-query";
import { createContext, useState } from "react";

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
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  const addMessage = () => sendMessage();

  <ChatContext.Provider
    value={{ addMessage, handleInputChange, isLoading, message }}
  >
    {children}
  </ChatContext.Provider>;
};
