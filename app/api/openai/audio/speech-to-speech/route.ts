import { NextRequest, NextResponse } from "next/server";
import openai from "@/utils/openai/client";
import { AITutorRole } from "@/utils/openai/chat";

// Configure Edge runtime
export const runtime = "edge";
export const maxDuration = 30; // 30 seconds timeout

export async function POST(request: NextRequest) {
  try {
    // Get form data from the request
    const formData = await request.formData();
    const audioFile = formData.get("file") as File | null;
    const tutorRole = (formData.get("tutorRole") as AITutorRole) || "general";
    const chatContext = (formData.get("chatContext") as string) || "[]";
    const voiceType = (formData.get("voice") as string) || "nova";
    const model = (formData.get("model") as string) || "gpt-4o";
    const temperature = Number(formData.get("temperature")) || 0.7;
    const ttsModel = (formData.get("ttsModel") as string) || "tts-1";
    const responseFormat = (formData.get("responseFormat") as string) || "mp3";
    const speed = Number(formData.get("speed")) || 1.0;

    // Validate audio file
    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    // Parse chat context
    let parsedChatContext;
    try {
      parsedChatContext = JSON.parse(chatContext);
      if (!Array.isArray(parsedChatContext)) {
        throw new Error("Chat context must be an array");
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid chat context format" },
        { status: 400 }
      );
    }

    // Step 1: Transcribe the audio to text using Whisper API
    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
    });

    const userText = transcription.text;

    // Step 2: Generate AI response using Chat API
    // Add system message if not present
    if (!parsedChatContext.some((msg: any) => msg.role === "system")) {
      parsedChatContext.unshift({
        role: "system",
        content: getSystemPromptForRole(tutorRole, true),
      });
    }

    // Add user message
    parsedChatContext.push({
      role: "user",
      content: userText,
    });

    // Call OpenAI Chat API
    const chatResponse = await openai.chat.completions.create({
      model,
      messages: parsedChatContext,
      temperature,
    });

    const aiResponseText = chatResponse.choices[0].message.content || "";

    // Add assistant message to context
    parsedChatContext.push({
      role: "assistant",
      content: aiResponseText,
    });

    // Step 3: Extract text for speech (remove writing instructions)
    const { text: speechText } = parseAIResponseForVoice(aiResponseText);

    // Step 4: Convert AI response to speech using TTS API
    const speechResponse = await openai.audio.speech.create({
      model: ttsModel,
      voice: voiceType as
        | "alloy"
        | "echo"
        | "fable"
        | "onyx"
        | "nova"
        | "shimmer",
      input: speechText,
      response_format: responseFormat as "mp3" | "opus" | "aac" | "flac",
      speed,
    });

    // Get the audio data as ArrayBuffer
    const audioData = await speechResponse.arrayBuffer();

    // Return combined response
    return new NextResponse(audioData, {
      headers: {
        "Content-Type": getContentType(responseFormat),
        "Content-Length": audioData.byteLength.toString(),
        "X-Transcription": encodeURIComponent(userText),
        "X-Response-Text": encodeURIComponent(aiResponseText),
        "X-Chat-Context": encodeURIComponent(JSON.stringify(parsedChatContext)),
      },
    });
  } catch (error: any) {
    console.error("OpenAI Audio API error:", error);

    return NextResponse.json(
      {
        error: "Error processing speech-to-speech request",
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

/**
 * Parse AI response text to extract any whiteboard writing instructions
 */
function parseAIResponseForVoice(response: string): {
  text: string;
  writingInstructions: {
    content: string;
    position?: { x: number; y: number };
  }[];
} {
  const writingInstructions: {
    content: string;
    position?: { x: number; y: number };
  }[] = [];

  // Use a simple approach without using the 's' flag which requires ES2018+
  const writingPattern = /\[writing\]([\s\S]*?)\[\/writing\]/;
  let cleanedText = response;
  let match;

  // Keep finding matches until there are no more
  while ((match = writingPattern.exec(cleanedText)) !== null) {
    const [fullMatch, content] = match;

    writingInstructions.push({
      content: content.trim(),
    });

    // Remove this writing instruction and continue
    cleanedText = cleanedText.replace(fullMatch, "");
  }

  // Clean up any double spaces or new lines caused by removing instructions
  cleanedText = cleanedText.replace(/\n\s*\n/g, "\n\n").trim();

  return {
    text: cleanedText,
    writingInstructions,
  };
}

/**
 * Get the system prompt based on the tutor role
 */
function getSystemPromptForRole(role: AITutorRole, useVoice: boolean): string {
  let basePrompt =
    "You are an AI tutor specialized in teaching students. Explain concepts clearly and provide step-by-step explanations.";

  // Add voice-specific instructions if voice is enabled
  if (useVoice) {
    basePrompt += `
You're speaking directly to the user through voice synthesis. Keep your responses conversational and well-paced. Use natural pauses indicated by punctuation (commas, periods). Avoid long, complex sentences that would be difficult to follow when spoken aloud.

When you need to write something on the whiteboard, indicate this clearly with [writing] and [/writing] tags. For example: "Let me explain this concept. [writing] Force = Mass × Acceleration [/writing] This formula shows the relationship between force, mass, and acceleration."
`;
  }

  switch (role) {
    case "math":
      return `${basePrompt} You excel at explaining mathematical concepts, formulas, and problem-solving techniques. Use the whiteboard to demonstrate mathematical steps clearly. ${useVoice ? "When explaining equations, speak them clearly and indicate when you're writing formulas on the whiteboard." : ""}`;

    case "science":
      return `${basePrompt} You are knowledgeable in scientific principles and theories. Use the whiteboard to illustrate scientific concepts with diagrams and explanations. ${useVoice ? "When describing scientific processes, speak clearly and use the whiteboard to illustrate key concepts." : ""}`;

    case "history":
      return `${basePrompt} You specialize in historical events, timelines, and connections between historical periods. Use the whiteboard to create timelines and highlight key historical events. ${useVoice ? "When explaining historical timelines, speak clearly about dates and events while illustrating them on the whiteboard." : ""}`;

    case "language":
      return `${basePrompt} You excel at explaining grammar rules, literary analysis, and language learning techniques. Use the whiteboard to diagram sentences or explain language patterns. ${useVoice ? "When teaching language concepts, speak clearly and use the whiteboard to show examples and patterns." : ""}`;

    case "general":
    default:
      return `${basePrompt} You can explain a wide range of subjects and concepts adaptively based on student needs. Use the whiteboard to visualize important information. ${useVoice ? "When teaching any subject, speak clearly and use the whiteboard to illustrate key concepts as needed." : ""}`;
  }
}
