"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings,
  X,
} from "lucide-react";
import { generateChatCompletion, AITutorRole } from "@/utils/openai/chat";
import { AIPDFUploaderComponent } from "@/components/teaching/pdf-uploader";
import {
  AIWhiteboardComponent,
  WhiteboardRef,
} from "@/components/teaching/whiteboard";
import {
  AIChatInterfaceComponent,
  ChatMessage,
} from "@/components/teaching/chat-interface";

export default function TeachingPage() {
  // State for PDF
  const [pdfInfo, setPdfInfo] = useState<{
    text: string;
    numPages: number;
    title?: string;
    filename: string;
  } | null>(null);

  // State for AI tutor role
  const [tutorRole, setTutorRole] = useState<AITutorRole>("general");

  // State for chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State for UI
  const [isPdfCollapsed, setIsPdfCollapsed] = useState(false);

  // State for voice
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Reference to whiteboard component for AI to use
  const whiteboardRef = useRef<WhiteboardRef>(null);

  // Generate prompt based on PDF content and tutor role
  const generatePrompt = (pdfText: string, role: AITutorRole): string => {
    return `You are an AI tutor specialized in ${role}. 
You're helping with a document titled "${pdfInfo?.title || pdfInfo?.filename}". 
Document content: ${pdfText.substring(0, 2000)}...`;
  };

  // Handle PDF processing
  const handlePDFProcessed = (pdfData: {
    text: string;
    numPages: number;
    title?: string;
    filename: string;
  }) => {
    setPdfInfo(pdfData);

    // Set voice enabled to ensure automatic conversation
    setVoiceEnabled(true);
    setVoiceError(null);

    // Generate initial AI message based on PDF content
    const initialSystemMessage: ChatMessage = {
      id: uuidv4(),
      role: "system",
      content: `PDF loaded: ${pdfData.filename}`,
      timestamp: Date.now(),
    };

    const initialAIMessage: ChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: `I've analyzed your document "${pdfData.filename}". What would you like to learn about it? You can ask me specific questions, or I can help explain key concepts.`,
      timestamp: Date.now(),
    };

    setMessages([initialSystemMessage, initialAIMessage]);
  };

  // Handle voice errors
  const handleVoiceError = (error: {
    type: string;
    message: string;
    isFinal: boolean;
    isRetrying?: boolean;
  }) => {
    setVoiceError(error.message);

    // If we have a final network error, show a helpful message
    if (error.type === "network" && error.isFinal && !error.isRetrying) {
      // Add a system message to inform the user
      const systemErrorMessage: ChatMessage = {
        id: uuidv4(),
        role: "system",
        content:
          "Voice recognition is having trouble connecting. You can continue using text input instead.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, systemErrorMessage]);
    }
  };

  // Handle sending a message to the AI
  const handleSendMessage = async (
    content: string,
    useVoice: boolean = voiceEnabled
  ) => {
    if (!pdfInfo) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Convert our messages to the format expected by the OpenAI API
      const apiMessages = messages
        .filter((msg) => msg.role !== "system")
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Add context about the PDF
      const systemMessage = {
        role: "system" as const,
        content: generatePrompt(pdfInfo.text, tutorRole),
      };

      // Add user message
      apiMessages.push({
        role: "user" as const,
        content,
      });

      // Configure voice instruction if needed
      let voiceInstruction = "";
      if (useVoice) {
        voiceInstruction = `
Since the user is using voice mode, please optimize your response for spoken conversation:
1. Keep your response concise and clear (under 150 words if possible).
2. Use natural, conversational language.
3. If you need to explain a complex concept, break it down into simple parts.
4. If there is visual or mathematical content to explain, use the whiteboard by enclosing text in [writing]...[/writing] tags.
`;
      }

      // Prepare the request body
      const requestBody = {
        model: "gpt-4o",
        messages: [systemMessage, ...apiMessages],
        max_tokens: 4000,
        temperature: 0.7,
        stream: false,
        system_instruction: voiceInstruction,
      };

      // Set up the URL for the API call
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/chat`;

      // Make the API call using fetch
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      // Parse the JSON response
      const data = await response.json();

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: data.content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Extract potential whiteboard commands from the AI response
      if (whiteboardRef.current && data.content.includes("[writing]")) {
        const regex = /\[writing\]([\s\S]*?)\[\/writing\]/g;
        let match;

        while ((match = regex.exec(data.content)) !== null) {
          const writingContent = match[1].trim();
          if (writingContent) {
            whiteboardRef.current.writeTextOnCanvas(
              writingContent,
              100 + Math.random() * 200,
              100 + Math.random() * 200
            );
          }
        }
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear the chat
  const handleClearChat = () => {
    const initialSystemMessage: ChatMessage = {
      id: uuidv4(),
      role: "system",
      content: `PDF loaded: ${pdfInfo?.filename}`,
      timestamp: Date.now(),
    };

    setMessages([initialSystemMessage]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Teaching Assistant</h1>
          <div className="flex items-center space-x-2">
            {/* Tutor role selector */}
            <select
              value={tutorRole}
              onChange={(e) => setTutorRole(e.target.value as AITutorRole)}
              className="p-2 border rounded"
            >
              <option value="general">General</option>
              <option value="math">Mathematics</option>
              <option value="science">Science</option>
              <option value="history">History</option>
              <option value="language">Language</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF section */}
        <div
          className={`border-r ${
            isPdfCollapsed ? "w-12" : "w-1/3"
          } flex flex-col transition-all duration-300 ease-in-out`}
        >
          <div className="flex justify-between items-center p-2 border-b">
            <h2 className={`font-semibold ${isPdfCollapsed ? "hidden" : ""}`}>
              Document
            </h2>
            <button
              onClick={() => setIsPdfCollapsed(!isPdfCollapsed)}
              className="p-1 rounded hover:bg-muted"
            >
              {isPdfCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
          </div>

          <div
            className={`flex-1 overflow-auto ${isPdfCollapsed ? "hidden" : ""}`}
          >
            {pdfInfo ? (
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <FileText className="mr-2" />
                  <span className="font-medium">{pdfInfo.filename}</span>
                </div>
                <div className="whitespace-pre-wrap text-sm border p-4 rounded bg-muted/50 max-h-[calc(100vh-12rem)] overflow-auto">
                  {pdfInfo.text.substring(0, 2000)}
                  {pdfInfo.text.length > 2000 && "..."}
                </div>
              </div>
            ) : (
              <div className="p-4">
                <AIPDFUploaderComponent
                  onPDFProcessed={handlePDFProcessed}
                  onPDFSuccess={() => {
                    // Auto-enable voice when PDF is uploaded
                    setVoiceEnabled(true);
                    setVoiceError(null);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Chat and whiteboard section */}
        <div className="flex-1 flex flex-col">
          {/* Whiteboard */}
          <div className="h-1/2 border-b overflow-hidden">
            <AIWhiteboardComponent ref={whiteboardRef} />
          </div>

          {/* Chat interface */}
          <div className="flex-1 flex flex-col">
            <AIChatInterfaceComponent
              messages={messages}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              isLoading={isLoading}
              voiceEnabled={voiceEnabled}
              setVoiceEnabled={setVoiceEnabled}
              isListening={isListening}
              setIsListening={setIsListening}
              isSpeaking={isSpeaking}
              setIsSpeaking={setIsSpeaking}
              onVoiceError={handleVoiceError}
              voiceError={voiceError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
