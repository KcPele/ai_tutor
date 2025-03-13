I'll implement a feature that enables voice conversation between the student and AI. When a user uploads a file, the AI will automatically initiate the conversation with voice, and the user can respond by speaking back.

Let me modify the necessary files to create this functionality:

```tsx
// components/teaching/chat-interface/index.tsx
// Modified to start voice automatically after PDF upload

useEffect(() => {
  // After a file is uploaded, if there's an AI message, automatically speak it
  if (
    voiceEnabled &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    pdfInfo
  ) {
    // Set a short delay to ensure everything is ready
    setTimeout(() => {
      if (speechSynthesisRef.current) {
        const latestMessage = messages[messages.length - 1];
        const { text } = parseAIResponseForVoice(latestMessage.content);

        setIsSpeaking(true);
        speechSynthesisRef.current.speak(text, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => {
            setIsSpeaking(false);
            // Auto-start listening after AI finishes speaking
            setIsListening(true);
          },
          onError: () => setIsSpeaking(false),
        });
      }
    }, 1000);
  }
}, [pdfInfo, messages, voiceEnabled]);
```

Now let's modify the `protected/teaching/page.tsx` file to enable voice by default and ensure the conversation starts automatically:

```tsx
// app/protected/teaching/page.tsx
// Update state to enable voice by default
const [voiceEnabled, setVoiceEnabled] = useState(true);

// Update the PDF handler to ensure voice is enabled
const handlePDFProcessed = (pdfData: {
  text: string;
  numPages: number;
  title?: string;
  filename: string;
}) => {
  setPdfInfo(pdfData);

  // Set voice enabled to ensure automatic conversation
  setVoiceEnabled(true);

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
```

We also need to modify the `handleSendMessage` function to ensure it uses voice mode:

```tsx
// app/protected/teaching/page.tsx
// Update handleSendMessage to always use voice mode when voiceEnabled is true
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

    // Configure voice instruction if voice mode is enabled
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

    // Make the API call
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

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
  } catch (error) {
    console.error("Error getting AI response:", error);
  } finally {
    setIsLoading(false);
  }
};
```

Let's also update the `AIVoiceInterfaceComponent` to enable auto-conversation mode when a file is uploaded:

```tsx
// components/teaching/voice-interface/index.tsx
// Add auto-conversation mode state and functionality

export function AIVoiceInterfaceComponent({
  onSpeechRecognized,
  onStartSpeaking,
  onStopSpeaking,
  isListening = false,
  isSpeaking = false,
  voiceEnabled,
  setVoiceEnabled,
  className = "",
}) {
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false);
  const [isSynthesisSupported, setIsSynthesisSupported] = useState(false);
  const [isLocalListening, setIsLocalListening] = useState(isListening);
  const [interimResult, setInterimResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [autoConversation, setAutoConversation] = useState(true); // Enable auto-conversation by default

  // ... existing code ...

  // Add toggle for auto-conversation mode
  const toggleAutoConversation = () => {
    setAutoConversation(!autoConversation);
  };

  // Update the speech recognition handler to automatically start listening after speaking
  useEffect(() => {
    // When speaking ends and auto-conversation is enabled, automatically start listening
    if (!isSpeaking && autoConversation && voiceEnabled && !isLocalListening) {
      const timer = setTimeout(() => {
        startListening();
      }, 1000); // Small delay to give user time to process what was said

      return () => clearTimeout(timer);
    }
  }, [isSpeaking, autoConversation, voiceEnabled, isLocalListening]);

  // Add UI element for auto-conversation toggle
  return (
    <div className="flex flex-col">
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Existing code... */}

        {/* Add auto-conversation toggle */}
        {voiceEnabled && (
          <button
            type="button"
            className={`p-2 rounded-full ${
              autoConversation
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
            onClick={toggleAutoConversation}
            title={
              autoConversation
                ? "Disable auto-conversation"
                : "Enable auto-conversation"
            }
          >
            <span className="text-xs">Auto</span>
          </button>
        )}

        {/* Rest of existing code... */}
      </div>

      {/* Rest of component... */}
    </div>
  );
}
```

Finally, let's update the PDF processor component to automatically enable voice mode when a PDF is uploaded:

```tsx
// components/teaching/pdf-uploader/index.tsx
// Modify to emit an event when PDF is processed successfully

interface PDFUploaderProps {
  onPDFProcessed: (result: {
    text: string;
    numPages: number;
    title?: string;
    filename: string;
  }) => void;
  onPDFSuccess?: () => void; // Add this callback to notify parent component
  className?: string;
}

export function AIPDFUploaderComponent({
  onPDFProcessed,
  onPDFSuccess,
  className = "",
}: PDFUploaderProps) {
  // ... existing code ...

  const handleFileChange = async (selectedFile: File) => {
    // ... existing code ...

    try {
      // ... existing code ...

      // Call the callback with the processed result
      onPDFProcessed({
        text,
        numPages: 1,
        filename: selectedFile.name,
      });

      setSuccess(true);

      // Notify parent component that processing succeeded
      if (onPDFSuccess) {
        onPDFSuccess();
      }
    } catch (err) {
      // ... existing error handling ...
    }
  };

  // ... rest of component ...
}
```

With these changes, we've implemented a voice conversation feature that:

1. Automatically enables voice mode when a PDF is uploaded
2. Has the AI start speaking the initial message after file upload
3. Automatically starts listening for user input after the AI finishes speaking
4. Toggles between speaking and listening in a conversation-like manner
5. Includes an "Auto" toggle button to turn this auto-conversation mode on/off

This creates a natural, hands-free interaction where the user can have a voice conversation with the AI about the uploaded document.
