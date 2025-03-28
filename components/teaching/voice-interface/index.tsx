"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
  Settings,
  AlertOctagon,
  WifiOff,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Import speech services
import { SpeechSynthesisService } from "@/utils/speech/speech-synthesis";
import { SpeechRecognitionService } from "@/utils/speech/speech-recognition";
import { SpeechService } from "@/utils/speech/speech-service";
import { AITutorRole } from "@/utils/openai/chat";

// Import audio controls component
import { AIAudioControlsComponent } from "./audio-controls";

export interface VoiceInterfaceProps {
  onSpeechRecognized: (text: string) => Promise<void>;
  onStartSpeaking?: () => void;
  onStopSpeaking?: () => void;
  isListening?: boolean;
  isSpeaking?: boolean;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  className?: string;
  messages?: any[];
  tutorRole?: AITutorRole;
}

export function AIVoiceInterfaceComponent({
  onSpeechRecognized,
  onStartSpeaking,
  onStopSpeaking,
  isListening = false,
  isSpeaking = false,
  voiceEnabled,
  setVoiceEnabled,
  className = "",
  messages = [],
  tutorRole = "general",
}: VoiceInterfaceProps) {
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false);
  const [isSynthesisSupported, setIsSynthesisSupported] = useState(false);
  const [isLocalListening, setIsLocalListening] = useState(isListening);
  const [interimResult, setInterimResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [autoConversation, setAutoConversation] = useState(false);
  const [networkErrorCount, setNetworkErrorCount] = useState(0);
  const [isSpeechToSpeechMode, setIsSpeechToSpeechMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [lastTranscription, setLastTranscription] = useState("");
  const [lastResponseAudio, setLastResponseAudio] = useState<string | null>(
    null
  );
  const [silenceDetectionActive, setSilenceDetectionActive] = useState(false);
  const [silenceDetectionCountdown, setSilenceDetectionCountdown] = useState<
    number | null
  >(null);
  const maxNetworkRetries = 3;

  const speechRecognitionRef = useRef<SpeechRecognitionService | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisService | null>(null);
  const speechServiceRef = useRef<SpeechService | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenceCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup speech services
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize speech recognition
      speechRecognitionRef.current = SpeechRecognitionService.getInstance();
      setIsRecognitionSupported(
        speechRecognitionRef.current?.isSupported() || false
      );

      // Initialize speech synthesis
      speechSynthesisRef.current = SpeechSynthesisService.getInstance();
      setIsSynthesisSupported(
        speechSynthesisRef.current?.isSupported() || false
      );

      // Initialize speech service for speech-to-speech
      speechServiceRef.current = SpeechService.getInstance();
    }

    // Setup audio element
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      if (onStopSpeaking) onStopSpeaking();
    };

    // Setup online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Initial check
    setIsOnline(navigator.onLine);

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      // Clean up speech services
      if (speechRecognitionRef.current?.isCurrentlyListening()) {
        speechRecognitionRef.current.stopListening();
      }
      if (speechSynthesisRef.current?.isSpeaking()) {
        speechSynthesisRef.current.stop();
      }
      if (speechServiceRef.current) {
        speechServiceRef.current.cancelSpeechToSpeech();
      }
      if (audioRef.current && lastResponseAudio) {
        URL.revokeObjectURL(lastResponseAudio);
      }

      // Remove event listeners
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [onStopSpeaking]);

  // Start/stop recognition based on isListening prop and voiceEnabled
  useEffect(() => {
    const recognitionService = speechRecognitionRef.current;
    if (!recognitionService || !isRecognitionSupported) return;

    if (
      isListening &&
      voiceEnabled &&
      !recognitionService.isCurrentlyListening() &&
      !isSpeechToSpeechMode
    ) {
      startListening();
    } else if (
      (!isListening || !voiceEnabled) &&
      recognitionService.isCurrentlyListening() &&
      !isSpeechToSpeechMode
    ) {
      stopListening();
    }
  }, [isListening, voiceEnabled, isRecognitionSupported, isSpeechToSpeechMode]);

  // Update auto conversation in speech service when changed
  useEffect(() => {
    if (speechServiceRef.current) {
      speechServiceRef.current.setAutoConversation(autoConversation);

      // Configure silence detection (enabled by default for auto conversation mode)
      if (autoConversation) {
        speechServiceRef.current.setSilenceDetection(true, 20000); // 20 seconds timeout
      }
    }
  }, [autoConversation]);

  // Handle starting the listening process (traditional web speech)
  const startListening = () => {
    const recognitionService = speechRecognitionRef.current;
    if (!recognitionService || !isRecognitionSupported || !voiceEnabled) return;

    // Clear any previous error messages
    setErrorMessage(null);
    setIsRetrying(false);
    setIsLocalListening(true);

    recognitionService.startListening({
      onStart: () => {
        setIsLocalListening(true);
        setInterimResult("");
        setIsRetrying(false);
        // Reset network error count on successful start
        setNetworkErrorCount(0);
      },
      onEnd: () => {
        // Only update UI if we're not in a retry state
        if (!isRetrying) {
          setIsLocalListening(false);
        }
      },
      onError: (error) => {
        console.error("Speech recognition error", error);

        // Handle network errors specifically
        if (error.type === "network") {
          // Increment network error count
          setNetworkErrorCount((prev) => prev + 1);

          // Handle retry status specially
          if (error.isRetrying) {
            setIsRetrying(true);
            setErrorMessage(error.message);
            return;
          }

          // If we've exceeded max retries, suggest fallback options
          if (networkErrorCount >= maxNetworkRetries) {
            setErrorMessage(
              "Voice recognition is having trouble connecting. You can try refreshing the page or using text input instead."
            );
            // Disable voice mode after too many failures
            if (networkErrorCount >= maxNetworkRetries + 2) {
              setVoiceEnabled(false);
              setErrorMessage(
                "Voice mode has been temporarily disabled due to connection issues. You can re-enable it using the toggle."
              );
            }
          }
        } else {
          // Handle retry status for other errors
          if (error.isRetrying) {
            setIsRetrying(true);
            setErrorMessage(error.message);
            return;
          }
        }

        // Handle final error
        if (error.isFinal) {
          setIsRetrying(false);
        }

        setIsLocalListening(false);
        setInterimResult("");

        // Display the error message to the user
        if (error.message) {
          setErrorMessage(error.message);
        }
      },
      onResult: (text, isFinal) => {
        if (!isFinal) {
          setInterimResult(text);
        } else {
          setInterimResult("");
          processRecognizedSpeech(text);
        }
      },
      maxNetworkRetries: maxNetworkRetries,
    });
  };

  // Handle stopping the listening process (traditional web speech)
  const stopListening = () => {
    const recognitionService = speechRecognitionRef.current;
    if (!recognitionService) return;

    recognitionService.stopListening();
    setIsLocalListening(false);
    setInterimResult("");
  };

  // Process recognized speech from traditional speech recognition
  const processRecognizedSpeech = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    // Also set the waiting for response state to show the processing indicator
    setIsWaitingForResponse(true);

    // Stop current speech synthesis if active
    if (speechSynthesisRef.current?.isSpeaking()) {
      speechSynthesisRef.current.stop();
    }

    try {
      await onSpeechRecognized(text);
    } catch (error) {
      console.error("Error processing speech", error);
    } finally {
      setIsProcessing(false);
      // Note: We don't set isWaitingForResponse to false here because we want
      // the indicator to stay visible until the AI response audio starts playing
    }
  };

  // Start speech-to-speech conversation
  const startSpeechToSpeech = async () => {
    if (!speechServiceRef.current || !voiceEnabled) return;

    if (audioRef.current && lastResponseAudio) {
      audioRef.current.pause();
      URL.revokeObjectURL(lastResponseAudio);
      setLastResponseAudio(null);
    }

    // Reset silence detection UI state
    setSilenceDetectionActive(false);
    setSilenceDetectionCountdown(null);
    if (silenceCountdownTimerRef.current) {
      clearInterval(silenceCountdownTimerRef.current);
      silenceCountdownTimerRef.current = null;
    }

    setIsRecording(true);
    setErrorMessage(null);

    try {
      const chatContext = buildChatContext();

      await speechServiceRef.current.startSpeechToSpeech({
        tutorRole,
        voice: "nova", // Could be customizable later
        model: "gpt-4o",
        silenceDetectionEnabled: autoConversation,
        silenceDetectionTimeout: 20000, // 20 seconds
        onTranscriptionStart: () => {
          setIsRecording(true);
          setIsWaitingForResponse(false);

          // If auto conversation is enabled, show silence detection is active
          if (autoConversation) {
            setSilenceDetectionActive(true);
            // Set initial countdown value to 20 seconds (matches the silence detection timeout)
            setSilenceDetectionCountdown(20);

            // Start a visual countdown timer that updates every second
            if (silenceCountdownTimerRef.current) {
              clearInterval(silenceCountdownTimerRef.current);
            }

            silenceCountdownTimerRef.current = setInterval(() => {
              setSilenceDetectionCountdown((prev) => {
                if (prev === null || prev <= 1) {
                  if (silenceCountdownTimerRef.current) {
                    clearInterval(silenceCountdownTimerRef.current);
                    silenceCountdownTimerRef.current = null;
                  }
                  return null;
                }
                return prev - 1;
              });
            }, 1000);
          }
        },
        onTranscriptionComplete: (text) => {
          setLastTranscription(text);
          setIsRecording(false);
          // Set waiting for response true here immediately after transcription is complete
          setIsWaitingForResponse(true);

          // Clear silence detection UI when transcription is complete
          setSilenceDetectionActive(false);
          setSilenceDetectionCountdown(null);
          if (silenceCountdownTimerRef.current) {
            clearInterval(silenceCountdownTimerRef.current);
            silenceCountdownTimerRef.current = null;
          }
        },
        onAIResponseStart: () => {
          // Keep waitingForResponse true until audio starts playing
          if (onStartSpeaking) onStartSpeaking();
        },
        onAIResponseText: async (text) => {
          // Pass the response text to the chat interface
          try {
            await onSpeechRecognized(lastTranscription);
          } catch (error) {
            console.error("Error updating chat with transcription:", error);
          }
        },
        onAIResponseAudio: (audioUrl) => {
          // Set waiting to false when audio is ready to play
          setIsWaitingForResponse(false);
          setLastResponseAudio(audioUrl);

          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play().catch((error) => {
              console.error("Error playing audio:", error);
            });
          }
        },
        onAIResponseComplete: () => {
          setIsWaitingForResponse(false);
          if (onStopSpeaking) onStopSpeaking();

          // Auto-restart if auto conversation is enabled
          if (autoConversation && speechServiceRef.current) {
            // Small delay before starting next recording
            setTimeout(() => {
              startSpeechToSpeech();
            }, 1000);
          }
        },
        onError: (error) => {
          console.error("Speech-to-speech error:", error);
          setErrorMessage(
            typeof error === "string" ? error : "Error processing speech"
          );
          setIsRecording(false);
          setIsWaitingForResponse(false);

          // Clear silence detection UI on error
          setSilenceDetectionActive(false);
          setSilenceDetectionCountdown(null);
          if (silenceCountdownTimerRef.current) {
            clearInterval(silenceCountdownTimerRef.current);
            silenceCountdownTimerRef.current = null;
          }
        },
      });

      // Set the chat context after initialization
      speechServiceRef.current.setChatContext(chatContext);
    } catch (error) {
      console.error("Error starting speech-to-speech:", error);
      setErrorMessage("Could not start speech conversation. Please try again.");
      setIsRecording(false);
      setIsWaitingForResponse(false);

      // Clear silence detection UI on error
      setSilenceDetectionActive(false);
      setSilenceDetectionCountdown(null);
      if (silenceCountdownTimerRef.current) {
        clearInterval(silenceCountdownTimerRef.current);
        silenceCountdownTimerRef.current = null;
      }
    }
  };

  // Stop speech-to-speech conversation
  const stopSpeechToSpeech = () => {
    if (!speechServiceRef.current) return;

    speechServiceRef.current.cancelSpeechToSpeech();
    setIsRecording(false);
    setIsWaitingForResponse(false);

    // Clear silence detection UI when stopping
    setSilenceDetectionActive(false);
    setSilenceDetectionCountdown(null);
    if (silenceCountdownTimerRef.current) {
      clearInterval(silenceCountdownTimerRef.current);
      silenceCountdownTimerRef.current = null;
    }

    if (audioRef.current && lastResponseAudio) {
      audioRef.current.pause();
    }
  };

  // Build chat context from messages
  const buildChatContext = () => {
    // Filter out system messages and format the rest
    return messages
      .filter((msg) => msg.role !== "system")
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
  };

  // Toggle voice enabled state
  const toggleVoiceEnabled = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);

    // Show help when enabling voice for the first time
    if (newState && isRecognitionSupported) {
      setShowHelp(true);
      setTimeout(() => setShowHelp(false), 8000);
    }

    // If turning off, stop any active listening/speaking
    if (!newState) {
      if (speechRecognitionRef.current?.isCurrentlyListening()) {
        speechRecognitionRef.current.stopListening();
      }
      if (speechSynthesisRef.current?.isSpeaking()) {
        speechSynthesisRef.current.stop();
      }
      if (speechServiceRef.current) {
        speechServiceRef.current.cancelSpeechToSpeech();
      }
      setShowAudioControls(false);
      setShowHelp(false);
      setAutoConversation(false);
    }
  };

  // Toggle speech-to-speech mode
  const toggleSpeechToSpeechMode = () => {
    const newMode = !isSpeechToSpeechMode;
    setIsSpeechToSpeechMode(newMode);

    // Clean up current activities
    if (speechRecognitionRef.current?.isCurrentlyListening()) {
      speechRecognitionRef.current.stopListening();
    }
    if (speechSynthesisRef.current?.isSpeaking()) {
      speechSynthesisRef.current.stop();
    }
    if (speechServiceRef.current) {
      speechServiceRef.current.cancelSpeechToSpeech();
    }

    setIsLocalListening(false);
    setInterimResult("");
    setIsRecording(false);
    setIsWaitingForResponse(false);
  };

  // Toggle automatic conversation mode
  const toggleAutoConversation = () => {
    setAutoConversation(!autoConversation);
  };

  // Handle mic button click
  const handleMicClick = () => {
    if (isSpeechToSpeechMode) {
      if (isRecording || isWaitingForResponse) {
        stopSpeechToSpeech();
      } else {
        startSpeechToSpeech();
      }
    } else {
      if (isLocalListening) {
        stopListening();
      } else {
        startListening();
      }
    }
  };

  // Calculate button states
  const micActive = isSpeechToSpeechMode
    ? isRecording || isWaitingForResponse
    : isLocalListening;

  const showLoadingIndicator = isSpeechToSpeechMode
    ? isWaitingForResponse
    : isProcessing || isRetrying;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up speech services
      if (speechRecognitionRef.current?.isCurrentlyListening()) {
        speechRecognitionRef.current.stopListening();
      }
      if (speechSynthesisRef.current?.isSpeaking()) {
        speechSynthesisRef.current.stop();
      }
      if (speechServiceRef.current) {
        speechServiceRef.current.cancelSpeechToSpeech();
      }
      if (audioRef.current && lastResponseAudio) {
        URL.revokeObjectURL(lastResponseAudio);
      }

      // Clear silence detection timer
      if (silenceCountdownTimerRef.current) {
        clearInterval(silenceCountdownTimerRef.current);
        silenceCountdownTimerRef.current = null;
      }
    };
  }, [onStopSpeaking, lastResponseAudio]);

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {/* Main voice controls */}
      <div className="flex items-center space-x-2">
        {/* Mic toggle button */}
        <Button
          type="button"
          size="icon"
          variant={micActive ? "default" : "outline"}
          className={cn(
            "h-9 w-9 rounded-full transition-all",
            micActive ? "bg-primary text-primary-foreground" : "",
            !voiceEnabled || !isRecognitionSupported ? "opacity-50" : ""
          )}
          onClick={handleMicClick}
          disabled={
            !voiceEnabled ||
            !isRecognitionSupported ||
            (isSpeaking && !isSpeechToSpeechMode)
          }
          aria-label={micActive ? "Stop listening" : "Start listening"}
          title={micActive ? "Stop listening" : "Start listening"}
        >
          {showLoadingIndicator ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : micActive ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>

        {/* Voice toggle button */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={cn(
            "h-9 w-9 rounded-full",
            !isSynthesisSupported ? "opacity-50" : ""
          )}
          onClick={toggleVoiceEnabled}
          disabled={!isSynthesisSupported}
          aria-label={voiceEnabled ? "Disable voice" : "Enable voice"}
          title={voiceEnabled ? "Disable voice" : "Enable voice"}
        >
          {voiceEnabled ? (
            <Volume2 className="h-4 w-4 text-primary" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>

        {/* Speech-to-speech mode toggle */}
        {voiceEnabled && isRecognitionSupported && (
          <Button
            type="button"
            size="icon"
            variant={isSpeechToSpeechMode ? "default" : "ghost"}
            className={cn(
              "h-9 w-9 rounded-full",
              isSpeechToSpeechMode ? "bg-primary/20 text-primary" : ""
            )}
            onClick={toggleSpeechToSpeechMode}
            title={
              isSpeechToSpeechMode
                ? "Switch to standard voice mode"
                : "Switch to speech-to-speech mode"
            }
          >
            <Repeat className="h-4 w-4" />
          </Button>
        )}

        {/* Auto conversation toggle for speech-to-speech mode */}
        {voiceEnabled && isSpeechToSpeechMode && (
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs cursor-pointer ${
              autoConversation
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
            onClick={toggleAutoConversation}
            title={
              autoConversation
                ? "Disable continuous conversation"
                : "Enable continuous conversation"
            }
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${autoConversation ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}
            ></span>
            Auto
          </div>
        )}

        {/* Mode indicator */}
        {voiceEnabled && (
          <Badge
            variant="outline"
            className={cn(
              "ml-2 text-xs",
              isSpeechToSpeechMode
                ? "border-primary text-primary"
                : "border-muted-foreground text-muted-foreground"
            )}
          >
            {isSpeechToSpeechMode ? "Speech-to-Speech" : "Voice Input"}
          </Badge>
        )}

        {/* Audio controls toggle */}
        {voiceEnabled && (
          <Button
            type="button"
            size="icon"
            variant={showAudioControls ? "default" : "ghost"}
            className="h-7 w-7 rounded-full ml-auto"
            onClick={() => setShowAudioControls(!showAudioControls)}
            aria-label={
              showAudioControls ? "Hide audio controls" : "Show audio controls"
            }
            title={
              showAudioControls ? "Hide audio controls" : "Show audio controls"
            }
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Network status indicator */}
        {!isOnline && (
          <div
            className="text-destructive flex items-center"
            title="You are offline. Voice features may not work."
          >
            <WifiOff className="h-4 w-4 mr-1" />
          </div>
        )}
      </div>

      {/* Status indicators */}
      {isSpeechToSpeechMode && (isRecording || isWaitingForResponse) && (
        <div className="text-xs text-primary flex items-center animate-pulse">
          {isRecording ? (
            <>
              <Mic className="h-3 w-3 mr-1.5" />
              <span>Listening...</span>
            </>
          ) : (
            <>
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              <span>Processing your speech...</span>
            </>
          )}
        </div>
      )}

      {/* Processing indicator overlay - shows when speech is being processed but AI hasn't responded yet */}
      {isWaitingForResponse && !silenceDetectionActive && (
        <div className="mt-1 p-2 bg-primary/5 border border-primary/10 rounded-md flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="flex space-x-1 mb-1.5">
              <div
                className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-primary/80 animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: "450ms" }}
              ></div>
            </div>
            <div className="text-xs font-medium text-primary/80">
              Processing your question...
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              The AI tutor is preparing your response
            </div>
          </div>
        </div>
      )}

      {/* Silence detection indicator */}
      {silenceDetectionActive && silenceDetectionCountdown !== null && (
        <div className="text-xs text-muted-foreground flex items-center">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
          <span>
            {silenceDetectionCountdown > 0
              ? `Silence detected. Sending in ${silenceDetectionCountdown}s...`
              : "Processing your speech..."}
            {silenceDetectionCountdown > 0 && (
              <button
                onClick={stopSpeechToSpeech}
                className="text-primary underline underline-offset-2 ml-1"
              >
                Send now
              </button>
            )}
          </span>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded flex items-start">
          <AlertOctagon className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Interim speech result */}
      {interimResult && (
        <div className="text-xs italic text-muted-foreground bg-muted/50 p-1.5 rounded">
          "{interimResult}"
        </div>
      )}

      {/* Speech-to-speech mode help tooltip */}
      {isSpeechToSpeechMode && showHelp && (
        <div className="text-xs bg-muted/80 p-2 rounded shadow-sm animate-fadeIn border border-primary/20">
          <p className="font-medium mb-1 text-primary">Speech-to-Speech Mode</p>
          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
            <li>Click the mic to start a voice conversation</li>
            <li>Your speech will be converted to text and processed</li>
            <li>The AI will respond with natural speech</li>
            <li>Enable "Auto" for continuous conversation</li>
            <li className="pl-4 mt-1">
              <span className="text-primary-foreground bg-primary/20 px-1 py-0.5 rounded text-[10px] font-medium">
                NEW
              </span>{" "}
              When "Auto" is enabled, recording will automatically end after 20
              seconds of silence
            </li>
          </ul>
        </div>
      )}

      {/* Voice mode help tooltip */}
      {!isSpeechToSpeechMode && showHelp && (
        <div className="text-xs bg-muted p-2 rounded animate-fadeIn">
          <p className="font-medium mb-1">Voice mode enabled</p>
          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
            <li>Click the mic to start/stop listening</li>
            <li>
              Try speech-to-speech mode for continuous voice conversations
            </li>
            <li>Click the settings icon for voice customization</li>
          </ul>
        </div>
      )}

      {/* Expandable audio controls */}
      {showAudioControls && (
        <AIAudioControlsComponent
          className="border rounded-md p-3 bg-card"
          voiceEnabled={voiceEnabled}
        />
      )}
    </div>
  );
}
