import { NextRequest, NextResponse } from "next/server";
import openai from "@/utils/openai/client";

// Define the request body type
interface RequestBody {
  text: string;
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  model?: string;
  response_format?: "mp3" | "opus" | "aac" | "flac";
  speed?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: RequestBody = await request.json();

    // Validate required fields
    if (!body.text || typeof body.text !== "string" || !body.text.trim()) {
      return NextResponse.json(
        { error: "Text is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Set default values
    const model = body.model || "tts-1";
    const voice = body.voice || "nova"; // Nova is a good default for educational content
    const responseFormat = body.response_format || "mp3";
    const speed = body.speed || 1.0;

    // Call OpenAI TTS API
    const response = await openai.audio.speech.create({
      model,
      voice,
      input: body.text,
      response_format: responseFormat,
      speed,
    });

    // Get the audio data as ArrayBuffer
    const audioData = await response.arrayBuffer();

    // Return the audio data with appropriate content type
    return new NextResponse(audioData, {
      headers: {
        "Content-Type": getContentType(responseFormat),
        "Content-Length": audioData.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error("OpenAI Audio API error:", error);

    return NextResponse.json(
      {
        error: "Error processing text-to-speech request",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Get the appropriate content type based on the response format
 */
function getContentType(format: string): string {
  switch (format) {
    case "mp3":
      return "audio/mpeg";
    case "opus":
      return "audio/opus";
    case "aac":
      return "audio/aac";
    case "flac":
      return "audio/flac";
    default:
      return "audio/mpeg";
  }
}
