"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

// Import SpeechSynthesisService
import { SpeechSynthesisService } from "@/utils/speech/speech-synthesis";

// Define types for Speech Recognition API
type SpeechRecognitionApi = {
  new (): {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort?: () => void;
    onresult: (event: any) => void;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: ((event: any) => void) | null;
  };
};

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
  const [recognition, setRecognition] = useState<any>(null);
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false);
  const [isSynthesisSupported, setIsSynthesisSupported] = useState(false);
  const [isLocalListening, setIsLocalListening] = useState(isListening);

  // Setup speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if browser supports speech recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsRecognitionSupported(true);
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";

        recognitionInstance.onresult = (event: any) => {
          // Find the final result from the current recognition session
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              const transcript = result[0].transcript.trim();
              if (transcript) {
                onSpeechRecognized(transcript);
              }
            }
          }
        };

        recognitionInstance.onstart = () => {
          setIsLocalListening(true);
        };

        recognitionInstance.onend = () => {
          setIsLocalListening(false);

          // Automatically restart if we're supposed to be listening
          if (isListening && voiceEnabled) {
            try {
              recognitionInstance.start();
            } catch (error) {
              // Ignore errors when automatically restarting
            }
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error", event);
          setIsLocalListening(false);
        };

        setRecognition(recognitionInstance);
      }

      // Check if browser supports speech synthesis
      setIsSynthesisSupported(!!window.speechSynthesis);
    }
  }, [onSpeechRecognized, isListening, voiceEnabled]);

  // Start/stop recognition based on isListening prop
  useEffect(() => {
    if (!recognition) return;

    if (isListening && voiceEnabled && !isLocalListening) {
      try {
        recognition.start();
      } catch (error) {
        // Handle case where recognition is already started
        console.log("Recognition already started");
      }
    } else if ((!isListening || !voiceEnabled) && isLocalListening) {
      try {
        recognition.stop();
      } catch (error) {
        // Handle case where recognition is already stopped
        console.log("Recognition already stopped");
      }
    }

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (error) {
          // Ignore errors when stopping on unmount
        }
      }
    };
  }, [isListening, recognition, voiceEnabled, isLocalListening]);

  // Toggle voice enabled state
  const toggleVoiceEnabled = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  // Toggle listening state manually
  const toggleListening = () => {
    if (!recognition || !isRecognitionSupported || !voiceEnabled) return;

    if (isLocalListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (error) {
        console.error("Error starting speech recognition", error);
      }
    }
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      <button
        type="button"
        className={`p-2 rounded-md ${voiceEnabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} hover:opacity-90 transition-colors`}
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

      {voiceEnabled && isRecognitionSupported && (
        <button
          type="button"
          className={`p-2 rounded-md ${isLocalListening ? "bg-red-500 text-white animate-pulse" : "bg-muted text-muted-foreground"} hover:opacity-90 transition-colors`}
          onClick={toggleListening}
          aria-label={isLocalListening ? "Stop listening" : "Start listening"}
          title={isLocalListening ? "Stop listening" : "Start listening"}
          disabled={!isRecognitionSupported}
        >
          {isLocalListening ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </button>
      )}

      {!isRecognitionSupported && !isSynthesisSupported && (
        <div className="text-xs text-muted-foreground">
          Voice features not supported in this browser
        </div>
      )}

      {isSpeaking && (
        <div className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full animate-pulse">
          Speaking...
        </div>
      )}
    </div>
  );
}
