"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizonal, User, Bot, Trash2 } from "lucide-react";
import { AITutorRole } from "@/utils/openai/chat";

// Message types
export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: number;
}

interface AIChatInterfaceProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: ChatMessage[];
  isLoading?: boolean;
  onClearChat?: () => void;
  tutorRole?: AITutorRole;
  className?: string;
}

export function AIChatInterfaceComponent({
  onSendMessage,
  messages,
  isLoading = false,
  onClearChat,
  tutorRole = "general",
  className = "",
}: AIChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [inputValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue("");

    await onSendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Format message content with basic markdown-like support
  const formatMessageContent = (content: string) => {
    // For code blocks
    content = content.replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-muted p-3 my-2 rounded-md overflow-x-auto"><code>$1</code></pre>'
    );

    // For inline code
    content = content.replace(
      /`([^`]+)`/g,
      '<code class="bg-muted px-1 py-0.5 rounded">$1</code>'
    );

    // For bold text
    content = content.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    // For italic text
    content = content.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    // For line breaks
    content = content.replace(/\n/g, "<br />");

    return content;
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center space-y-3">
              <Bot className="h-12 w-12 mx-auto text-primary/60" />
              <h3 className="text-lg font-medium">AI Teaching Assistant</h3>
              <p className="max-w-sm">
                I'm your AI tutor specialized in{" "}
                {tutorRole === "general" ? "various subjects" : tutorRole}. Ask
                me any questions about your learning materials!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {message.role === "user" ? "You" : "AI Tutor"}
                  </span>
                </div>
                <div
                  className="prose dark:prose-invert prose-sm"
                  dangerouslySetInnerHTML={{
                    __html: formatMessageContent(message.content),
                  }}
                />
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-muted">
              <div className="flex items-center space-x-2 mb-1">
                <Bot className="h-4 w-4" />
                <span className="text-sm font-medium">AI Tutor</span>
              </div>
              <div className="flex space-x-1 items-center h-6">
                <div className="animate-bounce h-2 w-2 bg-current rounded-full delay-0"></div>
                <div className="animate-bounce h-2 w-2 bg-current rounded-full delay-150"></div>
                <div className="animate-bounce h-2 w-2 bg-current rounded-full delay-300"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI tutor..."
              className="resize-none w-full rounded-md border-input px-3 py-2 bg-background border min-h-[40px] max-h-[150px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              rows={1}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
          >
            <SendHorizonal className="h-5 w-5" />
          </button>

          {onClearChat && messages.length > 0 && (
            <button
              type="button"
              onClick={onClearChat}
              className="p-2 rounded-md bg-muted hover:bg-muted/80"
              aria-label="Clear chat"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
