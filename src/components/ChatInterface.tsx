// src/components/ChatInterface.tsx
import React, { useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Message } from "../types";

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  resumeEmbedding: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  error,
  onSubmit,
  resumeEmbedding,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div
        className="h-64 overflow-auto border rounded p-2 mb-4"
        ref={chatContainerRef}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${
              message.role === "assistant" ? "text-blue-600" : "text-green-600"
            }`}
          >
            <strong>
              {message.role === "assistant" ? "Chatbot: " : "You: "}
            </strong>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ))}
        {isLoading && (
          <div className="text-gray-500">
            <em>Chatbot is thinking...</em>
          </div>
        )}
        {error && (
          <div className="text-red-500">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
      <form onSubmit={onSubmit} className="flex items-center">
        <Input
          type="text"
          name="message"
          placeholder="Type your message..."
          className="flex-grow mr-2"
          required
          aria-label="Type your message"
        />
        <Button type="submit" disabled={isLoading || !resumeEmbedding}>
          <Send className="w-5 h-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </>
  );
};

export default ChatInterface;
