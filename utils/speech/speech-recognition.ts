/**
 * Speech Recognition utility for speech-to-text functionality
 */

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: {
    type: string;
    message: string;
    isFinal: boolean;
    isRetrying?: boolean;
  }) => void;
  onResult?: (text: string, isFinal: boolean) => void;
  maxNetworkRetries?: number;
}

export class SpeechRecognitionService {
  private static instance: SpeechRecognitionService | null = null;
  private recognition: any = null;
  private isListening: boolean = false;
  private defaultOptions: SpeechRecognitionOptions = {
    language: "en-US",
    continuous: true,
    interimResults: true,
    maxNetworkRetries: 3,
  };
  private callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: {
      type: string;
      message: string;
      isFinal: boolean;
      isRetrying?: boolean;
    }) => void;
    onResult?: (text: string, isFinal: boolean) => void;
  };
  private networkRetryCount: number = 0;
  private maxNetworkRetries: number = 3;

  /**
   * Constructor
   * @private
   */
  private constructor() {
    if (typeof window !== "undefined") {
      const isSecureContext = window.isSecureContext;
      if (!isSecureContext) {
        console.warn(
          "Speech Recognition requires a secure context (HTTPS or localhost)."
        );
      }
    }

    this.initializeRecognition();
  }

  /**
   * Initialize the speech recognition instance
   */
  private initializeRecognition(): void {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.configureRecognition(this.defaultOptions);

        // Run a basic connectivity test
        this.checkConnectivity();
      }
    }
  }

  /**
   * Check connectivity to services needed for speech recognition
   */
  private async checkConnectivity(): Promise<void> {
    // Check if we're online according to browser
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      console.warn(
        "Browser reports offline status. Speech recognition may not work."
      );
      return;
    }

    // Try to ping a reliable service to verify connectivity
    try {
      const controller = new AbortController();
      const signal = controller.signal;

      // Set a timeout
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased timeout to 5 seconds

      // Try multiple reliable services in case one is blocked
      const connectivityEndpoints = [
        "https://www.google.com/generate_204",
        "https://www.cloudflare.com/cdn-cgi/trace",
        "https://httpbin.org/status/200",
      ];

      let connected = false;

      for (const endpoint of connectivityEndpoints) {
        if (connected) break;

        try {
          await fetch(endpoint, {
            method: "HEAD",
            mode: "no-cors",
            signal,
            cache: "no-store", // Prevent caching
          });
          connected = true;
        } catch (err) {
          console.warn(
            `Connectivity check to ${endpoint} failed, trying next...`
          );
        }
      }

      clearTimeout(timeoutId);

      if (connected) {
        console.log("Network connectivity confirmed for speech recognition");
      } else {
        console.warn(
          "All connectivity checks failed. Speech recognition might have issues."
        );
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.warn(
          "Network connectivity check timed out. Speech recognition might have issues."
        );
      } else {
        console.warn(
          "Network connectivity check failed. Speech recognition might have issues:",
          error
        );
      }
    }
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SpeechRecognitionService {
    if (!SpeechRecognitionService.instance) {
      SpeechRecognitionService.instance = new SpeechRecognitionService();
    }
    return SpeechRecognitionService.instance;
  }

  /**
   * Configure recognition with the given options
   * @param options Recognition options
   */
  private configureRecognition(options: SpeechRecognitionOptions): void {
    if (!this.recognition) return;

    // Save callbacks for later use
    this.callbacks = {
      onStart: options.onStart,
      onEnd: options.onEnd,
      onError: options.onError,
      onResult: options.onResult,
    };

    // Set options
    this.recognition.lang = options.language || this.defaultOptions.language;
    this.recognition.continuous =
      options.continuous ?? this.defaultOptions.continuous;
    this.recognition.interimResults =
      options.interimResults ?? this.defaultOptions.interimResults;
    this.maxNetworkRetries =
      options.maxNetworkRetries !== undefined
        ? options.maxNetworkRetries
        : this.defaultOptions.maxNetworkRetries!;
  }

  /**
   * Check if speech recognition is supported
   */
  public isSupported(): boolean {
    return !!this.recognition;
  }

  /**
   * Reset network retry counter
   */
  private resetNetworkRetryCount(): void {
    this.networkRetryCount = 0;
  }

  /**
   * Handle network errors by retrying with exponential backoff
   * @deprecated Use handleError instead which incorporates this functionality
   */
  private handleNetworkError(options: SpeechRecognitionOptions): void {
    if (this.networkRetryCount < this.maxNetworkRetries) {
      this.networkRetryCount++;

      const retryDelay = Math.min(
        1000 * Math.pow(2, this.networkRetryCount - 1),
        8000
      );

      console.log(
        `Network error detected. Retry attempt ${this.networkRetryCount}/${this.maxNetworkRetries} in ${retryDelay}ms`
      );

      if (options.onError) {
        options.onError({
          type: "network",
          message: `Network error. Retrying (${this.networkRetryCount}/${this.maxNetworkRetries})...`,
          isFinal: false,
          isRetrying: true,
        });
      }

      setTimeout(() => {
        if (this.recognition && this.isListening) {
          try {
            this.recognition.start();
          } catch (error) {
            console.error("Error restarting speech recognition", error);
            this.isListening = false;
            if (options.onEnd) options.onEnd();
          }
        }
      }, retryDelay);
    } else {
      // We've exceeded retry attempts
      this.resetNetworkRetryCount();
      this.isListening = false;

      if (options.onError) {
        options.onError({
          type: "network",
          message:
            "Network error. Unable to connect after multiple attempts. Please check your connection and try again.",
          isFinal: true,
          isRetrying: false,
        });
      }

      if (options.onEnd) options.onEnd();
    }
  }

  /**
   * Start listening for speech
   * @param options Recognition options
   * @returns Whether listening was successfully started
   */
  public startListening(options: SpeechRecognitionOptions = {}): boolean {
    if (!this.recognition) return false;

    // Reset network retry counter on new listening session
    this.resetNetworkRetryCount();

    // Configure with new options
    this.configureRecognition({ ...this.defaultOptions, ...options });

    // Set up event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.callbacks?.onStart) this.callbacks.onStart();
    };

    this.recognition.onend = () => {
      // Only mark as not listening if we're not in a retry state
      if (this.networkRetryCount === 0) {
        this.isListening = false;
        if (this.callbacks?.onEnd) this.callbacks.onEnd();
      }
    };

    this.recognition.onerror = this.handleError.bind(this);

    this.recognition.onresult = (event: any) => {
      // Reset network retry counter on successful results
      this.resetNetworkRetryCount();

      // Process results
      if (this.callbacks?.onResult && event.results) {
        const result = event.results[event.resultIndex];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;
        this.callbacks.onResult(transcript, isFinal);
      }
    };

    // Try to start recognition
    try {
      // Check if already listening
      if (this.isListening) {
        this.stopListening();
      }

      // Add a small delay to ensure previous session is fully stopped
      setTimeout(() => {
        try {
          this.recognition.start();
        } catch (e) {
          console.error("Failed to start speech recognition", e);
          this.isListening = false;
          if (this.callbacks?.onError) {
            this.callbacks.onError({
              type: "start_error",
              message: "Failed to start speech recognition. Please try again.",
              isFinal: true,
              isRetrying: false,
            });
          }
          return false;
        }
      }, 100);

      return true;
    } catch (e) {
      console.error("Failed to start speech recognition", e);
      this.isListening = false;
      if (this.callbacks?.onError) {
        this.callbacks.onError({
          type: "start_error",
          message: "Failed to start speech recognition. Please try again.",
          isFinal: true,
          isRetrying: false,
        });
      }
      return false;
    }
  }

  /**
   * Stop listening for speech
   */
  public stopListening(): void {
    if (!this.recognition || !this.isListening) return;

    // Reset network retry state when stopping manually
    this.resetNetworkRetryCount();

    try {
      this.recognition.stop();
      this.isListening = false;
    } catch (error) {
      console.error("Error stopping speech recognition", error);
    }
  }

  /**
   * Check if currently listening
   */
  public isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Handle speech recognition errors
   * @param event Error event
   */
  private handleError(event: any): void {
    console.log(`Speech recognition error detected: ${event.error}`, {
      error: event.error,
      message: event.message,
      timeStamp: event.timeStamp,
    });

    // Add detailed diagnostic information for network errors
    if (event.error === "network") {
      console.log("Network error details:", {
        online: typeof navigator !== "undefined" ? navigator.onLine : "unknown",
        secureContext:
          typeof window !== "undefined" ? window.isSecureContext : "unknown",
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        url: typeof window !== "undefined" ? window.location.href : "unknown",
        connectionType:
          typeof navigator !== "undefined" && "connection" in navigator
            ? (navigator as any).connection?.type
            : "unknown",
      });
    }

    const errorCallback = this.callbacks?.onError;
    if (errorCallback) {
      const errorType = event.error;
      let errorMessage = "";
      let isFinal = true;
      let isRetrying = false;

      // Handle the error based on its type
      switch (errorType) {
        case "network":
          // Check if we're online according to browser API
          if (typeof navigator !== "undefined" && !navigator.onLine) {
            errorMessage =
              "Your device appears to be offline. Please check your internet connection.";
          } else {
            errorMessage =
              "Network error. This could be due to a poor connection or network restrictions.";

            // Try network recovery if possible
            if (this.networkRetryCount < this.maxNetworkRetries) {
              this.networkRetryCount++;
              isRetrying = true;
              isFinal = false;

              // Exponential backoff for retries (1s, 2s, 4s)
              const retryDelay = Math.min(
                1000 * Math.pow(2, this.networkRetryCount - 1),
                8000
              );

              errorMessage = `Network connection issue. Retrying in ${retryDelay / 1000} seconds... (${this.networkRetryCount}/${this.maxNetworkRetries})`;

              // Schedule retry attempt
              setTimeout(() => this.retryAfterNetworkError(), retryDelay);
            } else {
              errorMessage =
                "Network connection failed after several attempts. Please check your connection and try again.";
            }
          }
          break;

        case "not-allowed":
        case "permission-denied":
          errorMessage =
            "Microphone access was denied. Please allow microphone access to use voice recognition.";
          break;

        case "aborted":
          errorMessage = "Speech recognition was aborted.";
          break;

        case "audio-capture":
          errorMessage =
            "Could not detect a microphone. Please check your audio settings.";
          break;

        case "no-speech":
          errorMessage =
            "No speech was detected. Please try speaking more clearly.";
          break;

        default:
          errorMessage = `Speech recognition error: ${event.error || "unknown error"}`;
      }

      errorCallback({
        type: errorType,
        message: errorMessage,
        isFinal,
        isRetrying,
      });
    }
  }

  /**
   * Retry speech recognition after a network error
   */
  private retryAfterNetworkError(): void {
    if (!this.recognition || !this.isListening) return;

    console.log(
      `Retrying speech recognition after network error (attempt ${this.networkRetryCount}/${this.maxNetworkRetries})`
    );

    // First, completely recreate the recognition instance to clear any potential issues
    this.initializeRecognition();

    // Short delay before restarting to allow any pending operations to complete
    setTimeout(() => {
      // Start recognition with same options
      try {
        this.recognition.start();
      } catch (e) {
        console.error(
          "Failed to restart speech recognition after network error",
          e
        );

        // Final failure - report to callback
        if (this.callbacks?.onError) {
          this.callbacks.onError({
            type: "network",
            message:
              "Unable to restart speech recognition. Please refresh the page and try again.",
            isFinal: true,
            isRetrying: false,
          });
        }
      }
    }, 500);
  }
}
