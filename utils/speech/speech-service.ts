/**
 * Comprehensive speech service that handles both speech recognition and synthesis
 * and provides methods for speech-to-speech conversations
 */

import { SpeechRecognitionService } from "./speech-recognition";
import { SpeechSynthesisService } from "./speech-synthesis";
import { AITutorRole } from "@/utils/openai/chat";

export interface SpeechToSpeechOptions {
  tutorRole?: AITutorRole;
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  model?: string;
  temperature?: number;
  ttsModel?: string;
  responseFormat?: "mp3" | "opus" | "aac" | "flac";
  speed?: number;
  silenceDetectionEnabled?: boolean;
  silenceDetectionTimeout?: number; // in milliseconds
  onTranscriptionStart?: () => void;
  onTranscriptionComplete?: (text: string) => void;
  onAIResponseStart?: () => void;
  onAIResponseText?: (text: string) => void;
  onAIResponseAudio?: (audioUrl: string) => void;
  onAIResponseComplete?: () => void;
  onError?: (error: any) => void;
}

export class SpeechService {
  private static instance: SpeechService | null = null;
  private recognitionService: SpeechRecognitionService;
  private synthesisService: SpeechSynthesisService;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphoneStream: MediaStream | null = null;
  private silenceDetectionTimer: NodeJS.Timeout | null = null;
  private lastAudioLevel: number = 0;
  private isRecording: boolean = false;
  private chatContext: any[] = [];
  private waitingForResponse: boolean = false;
  private autoConversation: boolean = false;
  private silenceDetectionEnabled: boolean = true;
  private silenceDetectionTimeout: number = 20000; // 20 seconds by default

  /**
   * Private constructor (singleton pattern)
   */
  private constructor() {
    this.recognitionService = SpeechRecognitionService.getInstance();
    this.synthesisService = SpeechSynthesisService.getInstance();
    this.chatContext = [];
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  /**
   * Check if speech recognition is supported
   */
  public isRecognitionSupported(): boolean {
    return this.recognitionService.isSupported();
  }

  /**
   * Check if speech synthesis is supported
   */
  public isSynthesisSupported(): boolean {
    return this.synthesisService.isSupported();
  }

  /**
   * Check if currently recording audio
   */
  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Check if currently speaking
   */
  public isCurrentlySpeaking(): boolean {
    return this.synthesisService.isSpeaking();
  }

  /**
   * Check if currently waiting for AI response
   */
  public isWaitingForResponse(): boolean {
    return this.waitingForResponse;
  }

  /**
   * Get current chat context
   */
  public getChatContext(): any[] {
    return [...this.chatContext];
  }

  /**
   * Set chat context
   */
  public setChatContext(context: any[]): void {
    this.chatContext = [...context];
  }

  /**
   * Clear chat context
   */
  public clearChatContext(): void {
    this.chatContext = [];
  }

  /**
   * Toggle auto conversation mode
   */
  public setAutoConversation(enabled: boolean): void {
    this.autoConversation = enabled;
  }

  /**
   * Get auto conversation state
   */
  public getAutoConversation(): boolean {
    return this.autoConversation;
  }

  /**
   * Set silence detection settings
   */
  public setSilenceDetection(enabled: boolean, timeout?: number): void {
    this.silenceDetectionEnabled = enabled;
    if (timeout !== undefined) {
      this.silenceDetectionTimeout = timeout;
    }
  }

  /**
   * Create an audio analyser for silence detection
   */
  private setupAudioAnalyser(stream: MediaStream): void {
    try {
      // First clean up any existing audio context
      this.cleanupSilenceDetection();

      // Create audio context
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create analyser
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 1024; // Larger FFT size for better analysis
      this.analyser.smoothingTimeConstant = 0.5; // Add some smoothing

      // Connect microphone stream to analyser
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);

      // Store stream reference for cleanup
      this.microphoneStream = stream;
    } catch (error) {
      console.error("Error setting up audio analyser:", error);
    }
  }

  /**
   * Detect silence by analyzing audio data
   */
  private startSilenceDetection(onSilenceDetected: () => void): void {
    if (!this.analyser || !this.audioContext || !this.silenceDetectionEnabled) {
      return;
    }

    // Create data array for analyzing audio levels
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    // Keep track of consecutive silent frames
    let silentFrameCount = 0;
    const silentFrameThreshold = 10; // Require multiple consecutive silent frames

    // Track speech activity
    let hasSpeechBeenDetected = false;
    let lastSpeechTime = Date.now();

    // Function to check audio levels
    const checkAudioLevel = () => {
      if (!this.isRecording || !this.analyser) {
        return;
      }

      // Get audio data
      this.analyser.getByteFrequencyData(dataArray);

      // Calculate average audio level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      this.lastAudioLevel = average;

      // Debug log (uncomment for testing)
      console.log("Audio level:", average);

      const now = Date.now();

      // Consider speech detected at higher threshold (20 instead of 15)
      if (average > 20) {
        silentFrameCount = 0; // Reset silent frame counter
        hasSpeechBeenDetected = true;
        lastSpeechTime = now;

        // Clear silence timer if running
        if (this.silenceDetectionTimer) {
          console.log("Speech detected, resetting silence timer");
          clearTimeout(this.silenceDetectionTimer);
          this.silenceDetectionTimer = null;
        }
      }
      // Count consecutive silent frames to avoid triggering on brief pauses
      else {
        silentFrameCount++;

        // Only consider silence detection after we've detected some speech
        // and only if we've had enough consecutive silent frames
        const silenceDuration = now - lastSpeechTime;

        if (
          hasSpeechBeenDetected &&
          silentFrameCount >= silentFrameThreshold &&
          !this.silenceDetectionTimer &&
          silenceDuration > 1000
        ) {
          // At least 1 second since last speech

          console.log("Silence detected after speech, starting timer...");
          this.silenceDetectionTimer = setTimeout(() => {
            console.log("Silence period ended, stopping recording...");
            // Force stop the recording and process it
            onSilenceDetected();
            this.silenceDetectionTimer = null;
          }, this.silenceDetectionTimeout);
        }
      }

      // Continue checking audio levels every 200ms (more frequent checks)
      if (this.isRecording) {
        setTimeout(checkAudioLevel, 200);
      }
    };

    // Start checking audio levels
    checkAudioLevel();
  }

  /**
   * Cleanup silence detection resources
   */
  private cleanupSilenceDetection(): void {
    if (this.silenceDetectionTimer) {
      clearTimeout(this.silenceDetectionTimer);
      this.silenceDetectionTimer = null;
    }

    if (this.audioContext) {
      if (this.audioContext.state !== "closed") {
        this.audioContext
          .close()
          .catch((err) => console.error("Error closing audio context:", err));
      }
      this.audioContext = null;
    }

    this.analyser = null;

    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach((track) => track.stop());
      this.microphoneStream = null;
    }
  }

  /**
   * Start recording audio
   */
  public async startRecording(
    options: {
      onStart?: () => void;
      onStop?: (audioBlob: Blob) => void;
      onError?: (error: any) => void;
      silenceDetectionEnabled?: boolean;
      silenceDetectionTimeout?: number;
    } = {}
  ): Promise<void> {
    if (this.isRecording) {
      return;
    }

    // Apply silence detection options if provided
    if (options.silenceDetectionEnabled !== undefined) {
      this.silenceDetectionEnabled = options.silenceDetectionEnabled;
    }
    if (options.silenceDetectionTimeout !== undefined) {
      this.silenceDetectionTimeout = options.silenceDetectionTimeout;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup audio analyser for silence detection
      if (this.silenceDetectionEnabled) {
        this.setupAudioAnalyser(stream);
      }

      // Create media recorder
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        // Create blob from chunks
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        this.isRecording = false;

        // Clean up
        stream.getTracks().forEach((track) => track.stop());

        // Cleanup silence detection
        this.cleanupSilenceDetection();

        if (options.onStop) {
          options.onStop(audioBlob);
        }
      };

      // Start recording
      this.mediaRecorder.start();
      this.isRecording = true;

      if (options.onStart) {
        options.onStart();
      }

      // Start silence detection if enabled in auto conversation mode
      if (this.silenceDetectionEnabled && this.autoConversation) {
        this.startSilenceDetection(() => {
          // When silence is detected, stop recording
          this.stopRecording();
        });
      }
    } catch (error) {
      console.error("Error starting recording:", error);

      // Cleanup silence detection
      this.cleanupSilenceDetection();

      if (options.onError) {
        options.onError(error);
      }
    }
  }

  /**
   * Stop recording audio
   */
  public stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      // Clear silence detection timer if exists
      if (this.silenceDetectionTimer) {
        clearTimeout(this.silenceDetectionTimer);
        this.silenceDetectionTimer = null;
      }

      console.log("Stopping recording...");
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  /**
   * Start speech-to-speech conversation
   * Records audio, sends to API, plays response
   */
  public async startSpeechToSpeech(
    options: SpeechToSpeechOptions = {}
  ): Promise<void> {
    if (this.waitingForResponse || this.isRecording) {
      return;
    }

    // Get silence detection options
    const silenceDetectionEnabled =
      options.silenceDetectionEnabled !== undefined
        ? options.silenceDetectionEnabled
        : this.silenceDetectionEnabled;

    const silenceDetectionTimeout =
      options.silenceDetectionTimeout !== undefined
        ? options.silenceDetectionTimeout
        : this.silenceDetectionTimeout;

    // Start recording audio
    await this.startRecording({
      onStart: () => {
        if (options.onTranscriptionStart) {
          options.onTranscriptionStart();
        }
      },
      onStop: async (audioBlob) => {
        try {
          this.waitingForResponse = true;

          // Create form data for API request
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");

          if (options.tutorRole) {
            formData.append("tutorRole", options.tutorRole);
          }

          // Add chat context from the service state
          formData.append("chatContext", JSON.stringify(this.chatContext));

          if (options.voice) {
            formData.append("voice", options.voice);
          }

          if (options.model) {
            formData.append("model", options.model);
          }

          if (options.temperature) {
            formData.append("temperature", options.temperature.toString());
          }

          if (options.ttsModel) {
            formData.append("ttsModel", options.ttsModel);
          }

          if (options.responseFormat) {
            formData.append("responseFormat", options.responseFormat);
          }

          if (options.speed) {
            formData.append("speed", options.speed.toString());
          }

          // Send to speech-to-speech API
          const response = await fetch("/api/openai/audio/speech-to-speech", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
          }

          // Get transcription from headers
          const transcription = decodeURIComponent(
            response.headers.get("X-Transcription") || ""
          );

          if (options.onTranscriptionComplete && transcription) {
            options.onTranscriptionComplete(transcription);
          }

          // Return immediately if no transcription
          if (!transcription.trim()) {
            throw new Error("No speech detected. Please try again.");
          }

          // Get AI response text from headers
          const aiResponseText = decodeURIComponent(
            response.headers.get("X-Response-Text") || ""
          );

          if (options.onAIResponseText && aiResponseText) {
            options.onAIResponseText(aiResponseText);
          }

          // Get updated chat context from headers
          const chatContextHeader = response.headers.get("X-Chat-Context");
          if (chatContextHeader) {
            try {
              this.chatContext = JSON.parse(
                decodeURIComponent(chatContextHeader)
              );
            } catch (error) {
              console.error("Error parsing chat context:", error);
            }
          }

          // Signal AI response starting
          if (options.onAIResponseStart) {
            options.onAIResponseStart();
          }

          // Get audio blob from response
          const responseAudioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(responseAudioBlob);

          if (options.onAIResponseAudio) {
            options.onAIResponseAudio(audioUrl);
          }

          // Play audio
          const audio = new Audio(audioUrl);
          audio.onended = () => {
            this.waitingForResponse = false;
            URL.revokeObjectURL(audioUrl); // Clean up the URL

            if (options.onAIResponseComplete) {
              options.onAIResponseComplete();
            }

            // If auto conversation is enabled, start recording again after response
            if (this.autoConversation) {
              setTimeout(() => {
                this.startSpeechToSpeech({
                  ...options,
                  silenceDetectionEnabled,
                  silenceDetectionTimeout,
                });
              }, 1000); // Small delay before starting the next recording
            }
          };

          audio.onerror = (error) => {
            console.error("Error playing audio:", error);
            this.waitingForResponse = false;
            URL.revokeObjectURL(audioUrl); // Clean up the URL

            if (options.onError) {
              options.onError(error);
            }
          };

          audio.play().catch((error) => {
            console.error("Error starting audio playback:", error);
            this.waitingForResponse = false;

            if (options.onError) {
              options.onError(error);
            }
          });
        } catch (error) {
          console.error("Speech-to-speech error:", error);
          this.waitingForResponse = false;

          if (options.onError) {
            options.onError(error);
          }
        }
      },
      onError: (error) => {
        console.error("Recording error:", error);
        this.waitingForResponse = false;

        if (options.onError) {
          options.onError(error);
        }
      },
      silenceDetectionEnabled,
      silenceDetectionTimeout,
    });
  }

  /**
   * Cancel current speech-to-speech operation
   */
  public cancelSpeechToSpeech(): void {
    // Stop recording if active
    if (this.isRecording) {
      this.stopRecording();
    }

    // Stop speech synthesis if active
    if (this.synthesisService.isSpeaking()) {
      this.synthesisService.stop();
    }

    // Clear silence detection
    this.cleanupSilenceDetection();

    this.waitingForResponse = false;
  }
}
