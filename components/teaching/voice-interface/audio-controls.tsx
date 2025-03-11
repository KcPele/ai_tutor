"use client";

import { useState, useEffect } from "react";
import {
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  MicOff,
  Settings,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { SpeechSynthesisService } from "@/utils/speech/speech-synthesis";

interface AudioControlsProps {
  voiceEnabled: boolean;
  className?: string;
}

export function AIAudioControlsComponent({
  voiceEnabled,
  className = "",
}: AudioControlsProps) {
  const [volume, setVolume] = useState(75);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(75);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && voiceEnabled) {
      // Get the speech synthesis service
      const synthService = SpeechSynthesisService.getInstance();

      // Get current global options
      const currentOptions = synthService.getGlobalOptions();

      // Apply the current settings
      if (currentOptions.rate) setRate(currentOptions.rate);
      if (currentOptions.pitch) setPitch(currentOptions.pitch);
      if (currentOptions.volume) {
        const volumeValue = Math.round(currentOptions.volume * 100);
        setVolume(volumeValue);
        setIsMuted(volumeValue === 0);
      }

      // Get available voices
      const voices = synthService.getVoices();
      setAvailableVoices(voices);

      // Set selected voice if there's a current voice
      if (currentOptions.voice) {
        setSelectedVoice(currentOptions.voice.name);
      }
      // Otherwise set default voice if none selected
      else if (!selectedVoice && voices.length > 0) {
        const bestVoice = synthService.getBestVoice();
        if (bestVoice) {
          setSelectedVoice(bestVoice.name);
          synthService.setGlobalOptions({ voice: bestVoice });
        }
      }
    }
  }, [voiceEnabled, selectedVoice]);

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }

    // Update speech synthesis
    if (typeof window !== "undefined") {
      const synthService = SpeechSynthesisService.getInstance();
      synthService.setGlobalOptions({
        volume: isMuted ? 0 : newVolume / 100,
      });
    }
  };

  // Handle speech rate change
  const handleRateChange = (value: number[]) => {
    const newRate = value[0];
    setRate(newRate);

    // Update speech synthesis
    if (typeof window !== "undefined") {
      const synthService = SpeechSynthesisService.getInstance();
      synthService.setGlobalOptions({ rate: newRate });
    }
  };

  // Handle pitch change
  const handlePitchChange = (value: number[]) => {
    const newPitch = value[0];
    setPitch(newPitch);

    // Update speech synthesis
    if (typeof window !== "undefined") {
      const synthService = SpeechSynthesisService.getInstance();
      synthService.setGlobalOptions({ pitch: newPitch });
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (newMuted) {
      setPreviousVolume(volume);
      setVolume(0);
    } else {
      setVolume(previousVolume || 75);
    }

    // Update speech synthesis
    if (typeof window !== "undefined") {
      const synthService = SpeechSynthesisService.getInstance();
      synthService.setGlobalOptions({
        volume: newMuted ? 0 : (previousVolume || 75) / 100,
      });
    }
  };

  // Get volume icon based on level
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 30) return <Volume className="h-4 w-4" />;
    if (volume < 70) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  // Handle voice selection change
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceName = e.target.value;
    setSelectedVoice(voiceName);

    // Update speech synthesis
    if (typeof window !== "undefined" && voiceName) {
      const synthService = SpeechSynthesisService.getInstance();
      const voice = synthService.getVoiceByName(voiceName);
      if (voice) {
        synthService.setGlobalOptions({ voice });
      }
    }
  };

  if (!voiceEnabled) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="bg-muted p-2 rounded-md hover:bg-muted/80 transition-colors"
            aria-label="Audio settings"
            title="Audio settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h3 className="font-medium">Audio Settings</h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="voice-volume">Volume</Label>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1 hover:bg-muted rounded-md"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {getVolumeIcon()}
                </button>
              </div>
              <Slider
                id="voice-volume"
                value={[volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                aria-label="Volume"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice-rate">Speech Rate</Label>
              <Slider
                id="voice-rate"
                value={[rate]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={handleRateChange}
                aria-label="Speech Rate"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice-pitch">Pitch</Label>
              <Slider
                id="voice-pitch"
                value={[pitch]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={handlePitchChange}
                aria-label="Pitch"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>Normal</span>
                <span>High</span>
              </div>
            </div>

            {availableVoices.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="voice-selection">Voice</Label>
                <select
                  id="voice-selection"
                  value={selectedVoice || ""}
                  onChange={handleVoiceChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <button
        type="button"
        onClick={toggleMute}
        className="bg-muted p-2 rounded-md hover:bg-muted/80 transition-colors"
        aria-label={isMuted ? "Unmute" : "Mute"}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {getVolumeIcon()}
      </button>
    </div>
  );
}
