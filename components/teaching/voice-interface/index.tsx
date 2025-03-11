"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
  Settings,
  AlertOctagon,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Import speech services
import { SpeechSynthesisService } from "@/utils/speech/speech-synthesis";
import { SpeechRecognitionService } from "@/utils/speech/speech-recognition";

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
}: VoiceInterfaceProps) {
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

  const speechRecognitionRef = useRef<SpeechRecognitionService | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisService | null>(null);

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
    }

    return () => {
      // Clean up speech services
      if (speechRecognitionRef.current?.isCurrentlyListening()) {
        speechRecognitionRef.current.stopListening();
      }
      if (speechSynthesisRef.current?.isSpeaking()) {
        speechSynthesisRef.current.stop();
      }
    };
  }, []);

  // Start/stop recognition based on isListening prop and voiceEnabled
  useEffect(() => {
    const recognitionService = speechRecognitionRef.current;
    if (!recognitionService || !isRecognitionSupported) return;

    if (
      isListening &&
      voiceEnabled &&
      !recognitionService.isCurrentlyListening()
    ) {
      startListening();
    } else if (
      (!isListening || !voiceEnabled) &&
      recognitionService.isCurrentlyListening()
    ) {
      stopListening();
    }
  }, [isListening, voiceEnabled, isRecognitionSupported]);

  // Handle starting the listening process
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
      },
      onEnd: () => {
        // Only update UI if we're not in a retry state
        if (!isRetrying) {
          setIsLocalListening(false);
        }
      },
      onError: (error) => {
        console.error("Speech recognition error", error);

        // Handle retry status specially
        if (error.isRetrying) {
          setIsRetrying(true);
          setErrorMessage(error.message);
          return;
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
          // Clear error message after a longer time for network errors
          setTimeout(
            () => setErrorMessage(null),
            error.type === "network" ? 8000 : 5000
          );
        }
      },
      onResult: (text, isFinal) => {
        setIsRetrying(false);
        if (isFinal) {
          setInterimResult("");
          // Only process if we have text and aren't already processing
          if (text && !isProcessing) {
            processRecognizedSpeech(text);
          }
        } else {
          setInterimResult(text);
        }
      },
    });
  };

  // Handle stopping the listening process
  const stopListening = () => {
    const recognitionService = speechRecognitionRef.current;
    if (!recognitionService) return;

    recognitionService.stopListening();
    setIsLocalListening(false);
    setInterimResult("");
  };

  // Process recognized speech
  const processRecognizedSpeech = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);

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
    }
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
      setShowAudioControls(false);
      setShowHelp(false);
    }
  };

  // Toggle listening state manually
  const toggleListening = () => {
    if (!isRecognitionSupported || !voiceEnabled) return;

    if (isLocalListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Add event listeners for online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="flex flex-col">
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Network status indicator */}
        {!isOnline && (
          <div className="absolute -top-10 right-0 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-md text-sm flex items-center gap-2 whitespace-nowrap z-10">
            <WifiOff size={16} />
            <span>You're offline</span>
          </div>
        )}

        {/* Voice mode toggle button */}
        <button
          type="button"
          className={`p-2 rounded-md ${
            voiceEnabled
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          } hover:opacity-90 transition-colors`}
          onClick={toggleVoiceEnabled}
          aria-label={
            voiceEnabled ? "Disable voice interface" : "Enable voice interface"
          }
          title={
            voiceEnabled ? "Disable voice interface" : "Enable voice interface"
          }
          disabled={!isRecognitionSupported && !isSynthesisSupported}
        >
          {voiceEnabled ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </button>

        {/* Microphone button */}
        <Button
          type="button"
          size="icon"
          variant={isListening ? "default" : "outline"}
          className={cn(
            "rounded-full",
            isListening && "bg-primary text-primary-foreground animate-pulse",
            !isRecognitionSupported && "opacity-50 cursor-not-allowed"
          )}
          disabled={!isRecognitionSupported || !isOnline || !voiceEnabled}
          onClick={toggleListening}
          title={
            !isRecognitionSupported
              ? "Speech recognition not supported in this browser"
              : !isOnline
                ? "Speech recognition requires an internet connection"
                : !voiceEnabled
                  ? "Enable voice mode first"
                  : isListening
                    ? "Stop listening"
                    : "Start listening"
          }
        >
          {isListening ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </Button>

        {voiceEnabled && (
          <button
            type="button"
            className={`p-2 rounded-md bg-muted text-muted-foreground hover:opacity-90 transition-colors ${
              showAudioControls ? "bg-primary/20" : ""
            }`}
            onClick={() => setShowAudioControls(!showAudioControls)}
            aria-label={
              showAudioControls ? "Hide audio settings" : "Show audio settings"
            }
            title={
              showAudioControls ? "Hide audio settings" : "Show audio settings"
            }
          >
            <Settings className="h-5 w-5" />
          </button>
        )}

        {isProcessing && (
          <div className="flex items-center text-xs text-primary animate-pulse">
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Processing...
          </div>
        )}

        {isRetrying && (
          <div className="flex items-center text-xs text-amber-500 animate-pulse">
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Reconnecting...
          </div>
        )}

        {interimResult && !isRetrying && (
          <div className="ml-2 text-xs max-w-xs truncate text-muted-foreground">
            "{interimResult}"
          </div>
        )}

        {!isRecognitionSupported && !isSynthesisSupported && (
          <div className="text-xs text-muted-foreground">
            Voice features not supported in this browser.
            <a
              href="https://caniuse.com/speech-recognition"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline text-primary"
            >
              Learn more
            </a>
          </div>
        )}

        {isSpeaking && (
          <div className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full animate-pulse">
            Speaking...
          </div>
        )}

        {/* Help tooltip */}
        {showHelp && (
          <div className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md max-w-xs">
            <p className="font-medium mb-1">Voice mode enabled</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Click the microphone to start speaking</li>
              <li>Allow microphone access when prompted</li>
              <li>Speak clearly when the mic is active</li>
            </ul>
          </div>
        )}

        {/* Error message display */}
        {errorMessage && !showHelp && (
          <div className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded-md max-w-xs overflow-hidden text-ellipsis">
            {errorMessage}
          </div>
        )}
      </div>

      {showAudioControls && voiceEnabled && (
        <div className="mt-2">
          <AIAudioControlsComponent voiceEnabled={voiceEnabled} />
        </div>
      )}
    </div>
  );
}
