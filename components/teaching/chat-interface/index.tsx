"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizonal, User, Bot, Trash2 } from "lucide-react";
import { AITutorRole } from "@/utils/openai/chat";
import { AIVoiceInterfaceComponent } from "../voice-interface";
import { SpeechSynthesisService } from "@/utils/speech/speech-synthesis";

// Message types
export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: number;
}

interface AIChatInterfaceProps {
  onSendMessage: (message: string, useVoice?: boolean) => Promise<void>;
  messages: ChatMessage[];
  isLoading?: boolean;
  onClearChat?: () => void;
  tutorRole?: AITutorRole;
  className?: string;
  whiteboardRef?: React.RefObject<any>;
}

export function AIChatInterfaceComponent({
  onSendMessage,
  messages,
  isLoading = false,
  onClearChat,
  tutorRole = "general",
  className = "",
  whiteboardRef,
}: AIChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoListen, setAutoListen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisService | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      speechSynthesisRef.current = SpeechSynthesisService.getInstance();
    }
    return () => {
      // Clean up speech synthesis
      if (speechSynthesisRef.current?.isSpeaking()) {
        speechSynthesisRef.current.stop();
      }
    };
  }, []);

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

  // Speak the latest AI message when voiceEnabled is true
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];

    if (
      voiceEnabled &&
      latestMessage &&
      latestMessage.role === "assistant" &&
      speechSynthesisRef.current &&
      !isLoading
    ) {
      // Parse the message to extract any writing instructions
      const { text, writingInstructions } = parseAIResponseForVoice(
        latestMessage.content
      );

      // Process writing instructions if whiteboard reference is available
      if (whiteboardRef?.current && writingInstructions.length > 0) {
        writingInstructions.forEach((instruction, index) => {
          // Stagger writing on whiteboard to make it more natural
          setTimeout(() => {
            // Calculate a reasonable position if not specified
            const position = instruction.position || {
              x: 100 + ((index * 50) % 400),
              y: 100 + Math.floor(index / 8) * 40,
            };

            whiteboardRef.current.writeTextOnCanvas(
              instruction.content,
              position.x,
              position.y,
              { animationSpeed: 20 }
            );
          }, index * 500); // Stagger by 500ms
        });
      }

      // Speak the clean text
      setIsSpeaking(true);
      speechSynthesisRef.current.speak(text, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => {
          setIsSpeaking(false);
          // Auto-start listening after AI finishes speaking if autoListen is enabled
          if (autoListen && voiceEnabled) {
            setIsListening(true);
          }
        },
        onError: () => setIsSpeaking(false),
      });
    }
  }, [messages, voiceEnabled, isLoading, whiteboardRef, autoListen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue("");

    await onSendMessage(message, voiceEnabled);
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

    // Remove [writing]...[/writing] markers if present
    content = content.replace(/\[writing\]([\s\S]*?)\[\/writing\]/g, "");

    return content;
  };

  // Handle speech recognized
  const handleSpeechRecognized = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Stop current speech synthesis if active
    if (speechSynthesisRef.current?.isSpeaking()) {
      speechSynthesisRef.current.stop();
      setIsSpeaking(false);
    }

    // Pause listening while processing the request
    setIsListening(false);

    await onSendMessage(text, voiceEnabled);
  };

  // Parse AI response to extract whiteboard writing instructions
  const parseAIResponseForVoice = (response: string) => {
    const writingInstructions: {
      content: string;
      position?: { x: number; y: number };
    }[] = [];

    // Find all writing instructions
    const writingPattern = /\[writing\]([\s\S]*?)\[\/writing\]/;
    let cleanedText = response;
    let match;

    // Keep finding matches until there are no more
    while ((match = writingPattern.exec(cleanedText)) !== null) {
      const [fullMatch, content] = match;

      writingInstructions.push({
        content: content.trim(),
      });

      // Remove this writing instruction and continue
      cleanedText = cleanedText.replace(fullMatch, "");
    }

    // Clean up any double spaces or new lines caused by removing instructions
    cleanedText = cleanedText.replace(/\n\s*\n/g, "\n\n").trim();

    return {
      text: cleanedText,
      writingInstructions,
    };
  };

  // Toggle auto-listen mode
  const toggleAutoListen = () => {
    setAutoListen(!autoListen);
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
              {voiceEnabled && (
                <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                  <p>Voice mode is enabled. You can:</p>
                  <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                    <li>Click the microphone icon to start/stop speaking</li>
                    <li>
                      Enable auto-conversation mode for hands-free interaction
                    </li>
                  </ul>
                </div>
              )}
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <AIVoiceInterfaceComponent
              onSpeechRecognized={handleSpeechRecognized}
              isListening={isListening}
              isSpeaking={isSpeaking}
              voiceEnabled={voiceEnabled}
              setVoiceEnabled={setVoiceEnabled}
              onStartSpeaking={() => setIsSpeaking(true)}
              onStopSpeaking={() => setIsSpeaking(false)}
            />

            {voiceEnabled && (
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs cursor-pointer ${
                  autoListen
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
                onClick={toggleAutoListen}
                title={
                  autoListen
                    ? "Disable auto-conversation"
                    : "Enable auto-conversation"
                }
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${autoListen ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}
                ></span>
                Auto
              </div>
            )}

            {onClearChat && (
              <button
                type="button"
                onClick={onClearChat}
                className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                title="Clear chat history"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>

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
        </form>
      </div>
    </div>
  );
}
