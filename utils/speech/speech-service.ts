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
  private isRecording: boolean = false;
  private chatContext: any[] = [];
  private waitingForResponse: boolean = false;
  private autoConversation: boolean = false;

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
   * Start recording audio
   */
  public async startRecording(
    options: {
      onStart?: () => void;
      onStop?: (audioBlob: Blob) => void;
      onError?: (error: any) => void;
    } = {}
  ): Promise<void> {
    if (this.isRecording) {
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

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
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());

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
    } catch (error) {
      console.error("Error starting recording:", error);
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
                this.startSpeechToSpeech(options);
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

    this.waitingForResponse = false;
  }
}
