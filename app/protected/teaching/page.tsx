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
  Volume2,
  Repeat,
  Info,
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
  const [showFeatureNotification, setShowFeatureNotification] = useState(true);

  // State for voice
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Reference to whiteboard component for AI to use
  const whiteboardRef = useRef<WhiteboardRef>(null);

  // Generate prompt based on PDF content and tutor role
  const generatePrompt = (pdfText: string, role: AITutorRole): string => {
    // Extract a representative summary of the document content
    const documentSummary = pdfText.substring(0, 5000); // Include more content for better context

    return `You are an AI tutor specialized in ${role} education. 
You're helping the student understand a document titled "${pdfInfo?.title || pdfInfo?.filename}".

DOCUMENT CONTENT:
${documentSummary}
${pdfText.length > 5000 ? "\n[Document continues beyond this excerpt, but you have access to its full content]" : ""}

YOUR ROLE:
- Explain concepts from this document clearly and accurately
- Use the whiteboard to illustrate key points (with [writing]...[/writing] tags)
- Answer questions specifically about this document
- If asked about something not in the document, clarify that it's outside the document's scope but provide helpful information if possible
- Engage in a natural teaching conversation about the document content

Focus on being a helpful teacher for this specific document.`;
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

    // Generate initial system message with comprehensive instructions
    const initialSystemMessage: ChatMessage = {
      id: uuidv4(),
      role: "system",
      content: `
TEACHING ASSISTANT INSTRUCTIONS:
You are an AI teaching assistant that specializes in explaining educational content. You have been provided with a document titled "${pdfData.title || pdfData.filename}" which is ${pdfData.numPages} pages long.

YOUR PRIMARY RESPONSIBILITIES:
1. Teach and explain the material in the document clearly and accurately
2. Use the whiteboard to illustrate concepts when helpful (using [writing]...[/writing] tags)
3. Answer questions specifically about the document content
4. Maintain a helpful, encouraging teaching tone
5. Break down complex concepts into understandable explanations
6. Only teach about what is in the document or what is directly relevant

DOCUMENT INFORMATION:
- Title: ${pdfData.title || pdfData.filename}
- Pages: ${pdfData.numPages}
- Type: PDF document

The user has just uploaded this document and is looking for your assistance in understanding its content.
`,
      timestamp: Date.now(),
    };

    // Generate a friendly initial AI welcome message
    const initialAIMessage: ChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: `I've analyzed your document "${pdfData.title || pdfData.filename}". 

I'm ready to help you understand its content! You can:
- Ask specific questions about any part of the document
- Request explanations of concepts or terms
- Ask me to illustrate key points on the whiteboard
- Get summaries of the main ideas

What would you like to learn about first?`,
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
      // Find the latest system message to use as context
      const systemMessage = messages.find((msg) => msg.role === "system") || {
        role: "system" as const,
        content: generatePrompt(pdfInfo.text, tutorRole),
      };

      // Convert our messages to the format expected by the OpenAI API
      const apiMessages = messages
        .filter((msg) => msg.role !== "system") // Filter out system messages from the conversation
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

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

  // Add useEffect to check localStorage for feature notification status
  useEffect(() => {
    // Check if user has already dismissed the notification
    const notificationDismissed = localStorage.getItem(
      "speechFeatureNotificationDismissed"
    );
    if (notificationDismissed === "true") {
      setShowFeatureNotification(false);
    }
  }, []);

  // Update dismissNotification function
  const dismissNotification = () => {
    setShowFeatureNotification(false);
    // Save user preference in localStorage
    localStorage.setItem("speechFeatureNotificationDismissed", "true");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* New Feature Notification */}
      {showFeatureNotification && (
        <div className="bg-primary/10 border border-primary/20 rounded-md p-3 m-3 flex items-start">
          <Info className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-sm text-primary">
              New Feature: Speech-to-Speech Conversations
            </h3>
            <p className="text-sm mt-1 text-muted-foreground">
              You can now have fully voiced conversations with the AI tutor.
              Click the <Repeat className="h-3 w-3 inline mx-0.5" /> icon in the
              voice controls to enable speech-to-speech mode.
            </p>
            <div className="mt-2 px-2 py-1.5 bg-background/50 rounded-sm border border-border/50 text-xs">
              <span className="font-medium">Auto-Send Update:</span> When using
              Auto mode, your message will now automatically send after 20
              seconds of silence - no need to click the mic again!
            </div>
          </div>
          <button
            onClick={dismissNotification}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
                  <FileText className="mr-2 text-primary" />
                  <span className="font-medium">{pdfInfo.filename}</span>
                </div>
                <div className="p-4 rounded bg-muted/50 border">
                  <h3 className="text-sm font-medium mb-2">Document Ready</h3>
                  <p className="text-sm text-muted-foreground">
                    The document has been successfully loaded. You can now ask
                    questions about its content.
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground flex items-center">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                      {pdfInfo.numPages}{" "}
                      {pdfInfo.numPages === 1 ? "page" : "pages"}
                    </span>
                    <span className="mx-2">•</span>
                    <span>The AI has access to the full document content</span>
                  </div>
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
