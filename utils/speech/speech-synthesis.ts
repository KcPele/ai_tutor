/**
 * Speech Synthesis utility for text-to-speech functionality
 */

export interface SpeechSynthesisOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

export class SpeechSynthesisService {
  private static instance: SpeechSynthesisService;
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private defaultOptions: SpeechSynthesisOptions = {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    lang: "en-US",
  };
  private globalOptions: SpeechSynthesisOptions = {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    lang: "en-US",
  };

  private constructor() {
    if (typeof window !== "undefined") {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();

      // Chrome loads voices asynchronously
      if (window.speechSynthesis?.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
      }
    }
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SpeechSynthesisService {
    if (!SpeechSynthesisService.instance) {
      SpeechSynthesisService.instance = new SpeechSynthesisService();
    }
    return SpeechSynthesisService.instance;
  }

  /**
   * Load available voices
   */
  private loadVoices(): void {
    if (this.synthesis) {
      this.voices = this.synthesis.getVoices();
    }
  }

  /**
   * Check if speech synthesis is supported
   */
  public isSupported(): boolean {
    return !!this.synthesis;
  }

  /**
   * Get a list of available voices
   */
  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Set global speech options that will be applied to all speech
   * @param options Global speech options
   */
  public setGlobalOptions(options: SpeechSynthesisOptions): void {
    this.globalOptions = { ...this.globalOptions, ...options };
  }

  /**
   * Get current global options
   */
  public getGlobalOptions(): SpeechSynthesisOptions {
    return { ...this.globalOptions };
  }

  /**
   * Get the best available voice for a given language
   * @param lang Language code (e.g., 'en-US')
   */
  public getBestVoice(lang: string = "en-US"): SpeechSynthesisVoice | null {
    // Try to find a native voice for the language
    const nativeVoice = this.voices.find(
      (voice) => voice.lang.includes(lang) && voice.localService
    );
    if (nativeVoice) return nativeVoice;

    // Otherwise, use any voice for the language
    const anyVoice = this.voices.find((voice) => voice.lang.includes(lang));
    if (anyVoice) return anyVoice;

    // If no matching voice, return the first available voice or null
    return this.voices.length > 0 ? this.voices[0] : null;
  }

  /**
   * Get a voice by name
   * @param name Voice name
   */
  public getVoiceByName(name: string): SpeechSynthesisVoice | null {
    return this.voices.find((voice) => voice.name === name) || null;
  }

  /**
   * Speak the provided text
   * @param text Text to speak
   * @param options Speech synthesis options
   */
  public speak(text: string, options: SpeechSynthesisOptions = {}): boolean {
    if (!this.synthesis) return false;
    if (!text) return false;

    // Cancel any ongoing speech
    this.stop();

    // Create utterance with merged options (global options take precedence over defaults)
    const mergedOptions = {
      ...this.defaultOptions,
      ...this.globalOptions,
      ...options,
    };
    const utterance = new SpeechSynthesisUtterance(text);

    // Set properties
    utterance.rate = mergedOptions.rate || 1.0;
    utterance.pitch = mergedOptions.pitch || 1.0;
    utterance.volume = mergedOptions.volume || 1.0;
    utterance.lang = mergedOptions.lang || "en-US";

    // Set voice if provided
    if (mergedOptions.voice) {
      utterance.voice = mergedOptions.voice;
    } else {
      // Otherwise use the best available voice
      const bestVoice = this.getBestVoice(utterance.lang);
      if (bestVoice) utterance.voice = bestVoice;
    }

    // Set event handlers
    utterance.onstart = () => {
      if (mergedOptions.onStart) mergedOptions.onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (mergedOptions.onEnd) mergedOptions.onEnd();
    };

    utterance.onerror = (event) => {
      this.currentUtterance = null;
      if (mergedOptions.onError) mergedOptions.onError(event);
    };

    // Store current utterance and start speaking
    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
    return true;
  }

  /**
   * Stop current speech
   */
  public stop(): void {
    if (!this.synthesis) return;
    this.synthesis.cancel();
    this.currentUtterance = null;
  }

  /**
   * Pause current speech
   */
  public pause(): void {
    if (!this.synthesis) return;
    this.synthesis.pause();
  }

  /**
   * Resume paused speech
   */
  public resume(): void {
    if (!this.synthesis) return;
    this.synthesis.resume();
  }

  /**
   * Check if currently speaking
   */
  public isSpeaking(): boolean {
    return !!this.synthesis && this.synthesis.speaking;
  }

  /**
   * Check if speech is paused
   */
  public isPaused(): boolean {
    return !!this.synthesis && this.synthesis.paused;
  }
}
