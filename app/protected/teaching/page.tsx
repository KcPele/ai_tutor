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

  // Reference to whiteboard component for AI to use
  const whiteboardRef = useRef<WhiteboardRef>(null);

  // Handle PDF processing
  const handlePDFProcessed = (pdfData: {
    text: string;
    numPages: number;
    title?: string;
    filename: string;
  }) => {
    setPdfInfo(pdfData);

    // Generate initial AI message based on PDF content
    const initialSystemMessage: ChatMessage = {
      id: uuidv4(),
      role: "system",
      content: `PDF loaded: ${pdfData.title || pdfData.filename}. ${pdfData.numPages} pages.`,
      timestamp: Date.now(),
    };

    const initialAIMessage: ChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: `I've analyzed your document "${pdfData.title || pdfData.filename}". What would you like to learn about it? You can ask me specific questions, or I can help explain key concepts.`,
      timestamp: Date.now(),
    };

    setMessages([initialSystemMessage, initialAIMessage]);
  };

  // Handle sending a message to the AI
  const handleSendMessage = async (content: string) => {
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
        content: `You are an AI tutor specialized in ${tutorRole}. You're helping with a document titled "${pdfInfo.title || pdfInfo.filename}". Document content: ${pdfInfo.text.substring(0, 2000)}...`,
      };

      // Add the new user message
      apiMessages.push({
        role: "user" as const,
        content,
      });

      // Get response from OpenAI
      const aiResponse = await generateChatCompletion({
        messages: [systemMessage, ...apiMessages],
        tutorRole,
      });

      if (!aiResponse) throw new Error("Failed to get AI response");

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: aiResponse,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Extract potential whiteboard commands from the AI response
      // This is a simple approach - in a real app, you'd want a more robust way to handle this
      if (whiteboardRef.current && aiResponse.includes("WHITEBOARD:")) {
        const whiteboardCommands = aiResponse.match(
          /WHITEBOARD:([^]*?)END_WHITEBOARD/g
        );

        if (whiteboardCommands) {
          whiteboardCommands.forEach((command) => {
            const content = command
              .replace("WHITEBOARD:", "")
              .replace("END_WHITEBOARD", "")
              .trim();

            // Write the content on the whiteboard
            // In a production app, you'd parse the command to determine position, style, etc.
            whiteboardRef.current?.writeTextOnCanvas(content, 50, 50);
          });
        }
      }
    } catch (error) {
      console.error("Error getting AI response:", error);

      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear the chat
  const handleClearChat = () => {
    const initialSystemMessage: ChatMessage = {
      id: uuidv4(),
      role: "system",
      content: `PDF loaded: ${pdfInfo?.title || pdfInfo?.filename}. ${pdfInfo?.numPages} pages.`,
      timestamp: Date.now(),
    };

    setMessages([initialSystemMessage]);
  };

  // Set the tutor role
  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTutorRole(event.target.value as AITutorRole);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="py-4 px-6 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">AI Teaching Assistant</h1>

        <div className="flex items-center space-x-4">
          {pdfInfo && (
            <div className="flex items-center text-sm text-muted-foreground">
              <FileText className="h-4 w-4 mr-1" />
              <span className="max-w-xs truncate">
                {pdfInfo.title || pdfInfo.filename}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <select
              value={tutorRole}
              onChange={handleRoleChange}
              className="text-sm bg-background border rounded-md px-2 py-1"
              aria-label="Select AI tutor role"
            >
              <option value="general">General</option>
              <option value="math">Math</option>
              <option value="science">Science</option>
              <option value="history">History</option>
              <option value="language">Language</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - PDF uploader or viewer */}
        <div
          className={`border-r flex flex-col ${isPdfCollapsed ? "w-12" : "w-1/3"}`}
        >
          <div className="flex justify-between items-center p-3 border-b">
            <h2
              className={`font-medium ${isPdfCollapsed ? "hidden" : "block"}`}
            >
              {pdfInfo ? "Document" : "Upload Document"}
            </h2>
            <button
              onClick={() => setIsPdfCollapsed(!isPdfCollapsed)}
              className="p-1 hover:bg-muted rounded-md"
              aria-label={
                isPdfCollapsed
                  ? "Expand document panel"
                  : "Collapse document panel"
              }
            >
              {isPdfCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
          </div>

          <div
            className={`flex-1 overflow-y-auto p-4 ${isPdfCollapsed ? "hidden" : "block"}`}
          >
            {!pdfInfo ? (
              <AIPDFUploaderComponent onPDFProcessed={handlePDFProcessed} />
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                <h3>{pdfInfo.title || pdfInfo.filename}</h3>
                <p className="text-sm text-muted-foreground">
                  {pdfInfo.numPages} pages
                </p>
                <div className="mt-4 border rounded-md p-4 max-h-[60vh] overflow-y-auto">
                  {pdfInfo.text.split("\n").map((paragraph, i) => (
                    <p
                      key={i}
                      className={paragraph.trim() === "" ? "my-4" : ""}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Whiteboard */}
          <div className="border-b h-1/2 overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b">
              <h2 className="font-medium">Interactive Whiteboard</h2>
              <button
                onClick={() => {
                  const whiteboardContainer = document.getElementById(
                    "whiteboard-container"
                  );
                  whiteboardContainer?.classList.toggle("h-1/2");
                  whiteboardContainer?.classList.toggle("h-3/4");
                }}
                className="p-1 hover:bg-muted rounded-md"
                aria-label="Resize whiteboard"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
            <div
              id="whiteboard-container"
              className="h-full overflow-hidden p-4"
            >
              <AIWhiteboardComponent ref={whiteboardRef} className="h-full" />
            </div>
          </div>

          {/* Chat interface */}
          <div className="flex-1 overflow-hidden">
            <AIChatInterfaceComponent
              onSendMessage={handleSendMessage}
              messages={messages}
              isLoading={isLoading}
              onClearChat={handleClearChat}
              tutorRole={tutorRole}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
