"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizonal, User, Bot, Trash2, Repeat } from "lucide-react";
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
  pdfInfo?: boolean;
  voiceEnabled?: boolean;
  setVoiceEnabled?: (enabled: boolean) => void;
  isListening?: boolean;
  setIsListening?: (listening: boolean) => void;
  isSpeaking?: boolean;
  setIsSpeaking?: (speaking: boolean) => void;
  onVoiceError?: (error: {
    type: string;
    message: string;
    isFinal: boolean;
    isRetrying?: boolean;
  }) => void;
  voiceError?: string | null;
}

export function AIChatInterfaceComponent({
  onSendMessage,
  messages,
  isLoading = false,
  onClearChat,
  tutorRole = "general",
  className = "",
  whiteboardRef,
  pdfInfo,
  voiceEnabled: externalVoiceEnabled,
  setVoiceEnabled: externalSetVoiceEnabled,
  isListening: externalIsListening,
  setIsListening: externalSetIsListening,
  isSpeaking: externalIsSpeaking,
  setIsSpeaking: externalSetIsSpeaking,
  onVoiceError,
  voiceError: externalVoiceError,
}: AIChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const [voiceEnabled, setVoiceEnabledLocal] = useState(true);
  const [isListening, setIsListeningLocal] = useState(false);
  const [isSpeaking, setIsSpeakingLocal] = useState(false);
  const [autoListen, setAutoListen] = useState(false);
  const [localVoiceError, setLocalVoiceError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisService | null>(null);

  const effectiveVoiceEnabled =
    externalVoiceEnabled !== undefined ? externalVoiceEnabled : voiceEnabled;
  const effectiveSetVoiceEnabled =
    externalSetVoiceEnabled || setVoiceEnabledLocal;
  const effectiveIsListening =
    externalIsListening !== undefined ? externalIsListening : isListening;
  const effectiveSetIsListening = externalSetIsListening || setIsListeningLocal;
  const effectiveIsSpeaking =
    externalIsSpeaking !== undefined ? externalIsSpeaking : isSpeaking;
  const effectiveSetIsSpeaking = externalSetIsSpeaking || setIsSpeakingLocal;
  const effectiveVoiceError =
    externalVoiceError !== undefined ? externalVoiceError : localVoiceError;

  useEffect(() => {
    if (typeof window !== "undefined") {
      speechSynthesisRef.current = SpeechSynthesisService.getInstance();
    }
    return () => {
      if (speechSynthesisRef.current?.isSpeaking()) {
        speechSynthesisRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];

    if (
      effectiveVoiceEnabled &&
      latestMessage &&
      latestMessage.role === "assistant" &&
      speechSynthesisRef.current &&
      !isLoading
    ) {
      const { text, writingInstructions } = parseAIResponseForVoice(
        latestMessage.content
      );

      if (whiteboardRef?.current && writingInstructions.length > 0) {
        writingInstructions.forEach((instruction, index) => {
          setTimeout(() => {
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
          }, index * 500);
        });
      }

      setIsSpeakingLocal(true);
      speechSynthesisRef.current.speak(text, {
        onStart: () => setIsSpeakingLocal(true),
        onEnd: () => {
          setIsSpeakingLocal(false);
          if (autoListen && effectiveVoiceEnabled) {
            setIsListeningLocal(true);
          }
        },
        onError: () => setIsSpeakingLocal(false),
      });
    }
  }, [messages, effectiveVoiceEnabled, isLoading, whiteboardRef, autoListen]);

  useEffect(() => {
    if (
      effectiveVoiceEnabled &&
      messages.length > 0 &&
      messages[messages.length - 1].role === "assistant" &&
      pdfInfo
    ) {
      setTimeout(() => {
        if (speechSynthesisRef.current) {
          const latestMessage = messages[messages.length - 1];
          const { text } = parseAIResponseForVoice(latestMessage.content);

          setIsSpeakingLocal(true);
          speechSynthesisRef.current.speak(text, {
            onStart: () => setIsSpeakingLocal(true),
            onEnd: () => {
              setIsSpeakingLocal(false);
              setIsListeningLocal(true);
            },
            onError: () => setIsSpeakingLocal(false),
          });
        }
      }, 1000);
    }
  }, [pdfInfo, messages, effectiveVoiceEnabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue("");

    await onSendMessage(message, effectiveVoiceEnabled);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatMessageContent = (content: string) => {
    content = content.replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-muted p-3 my-2 rounded-md overflow-x-auto"><code>$1</code></pre>'
    );

    content = content.replace(
      /`([^`]+)`/g,
      '<code class="bg-muted px-1 py-0.5 rounded">$1</code>'
    );

    content = content.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    content = content.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    content = content.replace(/\n/g, "<br />");

    content = content.replace(/\[writing\]([\s\S]*?)\[\/writing\]/g, "");

    return content;
  };

  const handleSpeechRecognized = async (text: string) => {
    if (!text.trim()) return;

    effectiveSetIsListening(false);

    try {
      await onSendMessage(text, effectiveVoiceEnabled);
    } catch (error) {
      console.error("Error sending speech message:", error);
    }
  };

  const parseAIResponseForVoice = (response: string) => {
    const writingInstructions: {
      content: string;
      position?: { x: number; y: number };
    }[] = [];

    const writingPattern = /\[writing\]([\s\S]*?)\[\/writing\]/;
    let cleanedText = response;
    let match;

    while ((match = writingPattern.exec(cleanedText)) !== null) {
      const [fullMatch, content] = match;

      writingInstructions.push({
        content: content.trim(),
      });

      cleanedText = cleanedText.replace(fullMatch, "");
    }

    cleanedText = cleanedText.replace(/\n\s*\n/g, "\n\n").trim();

    return {
      text: cleanedText,
      writingInstructions,
    };
  };

  const toggleAutoListen = () => {
    setAutoListen(!autoListen);
  };

  const handleVoiceError = (error: {
    type: string;
    message: string;
    isFinal: boolean;
    isRetrying?: boolean;
  }) => {
    if (onVoiceError) {
      onVoiceError(error);
    } else {
      setLocalVoiceError(error.message);
      setTimeout(() => setLocalVoiceError(null), 5000);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center space-y-3 max-w-md">
              <Bot className="h-12 w-12 mx-auto text-primary/60" />
              <h3 className="text-lg font-medium">AI Teaching Assistant</h3>
              <p>
                I'm your AI tutor specialized in{" "}
                {tutorRole === "general" ? "various subjects" : tutorRole}. Ask
                me any questions about your learning materials!
              </p>
              {effectiveVoiceEnabled && (
                <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                  <p className="font-medium text-foreground">
                    Voice Features Available:
                  </p>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-background rounded-md p-2 flex flex-col">
                      <span className="text-xs font-medium text-primary mb-1">
                        Voice Input
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Click the microphone icon to speak your questions
                        instead of typing.
                      </p>
                    </div>
                    <div className="bg-background rounded-md p-2 flex flex-col">
                      <span className="text-xs font-medium text-primary mb-1">
                        Speech-to-Speech
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Click the <Repeat className="h-3 w-3 inline mx-0.5" />{" "}
                        icon to enable fully voiced conversations.
                      </p>
                    </div>
                  </div>
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

      {effectiveVoiceError && (
        <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm">
          {effectiveVoiceError}
        </div>
      )}

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <AIVoiceInterfaceComponent
              onSpeechRecognized={handleSpeechRecognized}
              isListening={effectiveIsListening}
              isSpeaking={effectiveIsSpeaking}
              voiceEnabled={effectiveVoiceEnabled}
              setVoiceEnabled={effectiveSetVoiceEnabled}
              onStartSpeaking={() => effectiveSetIsSpeaking(true)}
              onStopSpeaking={() => effectiveSetIsSpeaking(false)}
              messages={messages}
              tutorRole={tutorRole}
            />

            {effectiveVoiceEnabled && (
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
