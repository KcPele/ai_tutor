import { NextRequest, NextResponse } from "next/server";
import openai from "@/utils/openai/client";

export async function POST(request: NextRequest) {
  try {
    // Get form data from the request
    const formData = await request.formData();
    const audioFile = formData.get("file") as File | null;
    const model = (formData.get("model") as string) || "whisper-1";
    const language = (formData.get("language") as string) || "";
    const prompt = (formData.get("prompt") as string) || "";

    // Validate audio file
    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    // Create options object
    const options: any = {
      model,
      file: audioFile,
    };

    // Add optional parameters if provided
    if (language) options.language = language;
    if (prompt) options.prompt = prompt;

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create(options);

    // Return the transcription
    return NextResponse.json({
      text: transcription.text,
    });
  } catch (error: any) {
    console.error("OpenAI Audio API error:", error);

    // Handle different error types
    if (error.status === 413) {
      return NextResponse.json(
        {
          error: "File too large. Please upload a smaller audio file.",
        },
        { status: 413 }
      );
    }

    return NextResponse.json(
      {
        error: "Error processing speech-to-text request",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
