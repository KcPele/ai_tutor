import { NextRequest, NextResponse } from "next/server";
import openai from "@/utils/openai/client";
import { AITutorRole } from "@/utils/openai/chat";

// Define the request body type
interface RequestBody {
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  tutorRole?: AITutorRole;
  model?: string;
  temperature?: number;
  useVoice?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: RequestBody = await request.json();

    // Validate required fields
    if (
      !body.messages ||
      !Array.isArray(body.messages) ||
      body.messages.length === 0
    ) {
      return NextResponse.json(
        { error: "Messages are required and must be an array" },
        { status: 400 }
      );
    }

    // Set default values
    const model = body.model || "gpt-4o";
    const temperature = body.temperature ?? 0.7;
    const tutorRole = body.tutorRole || "general";
    const useVoice = body.useVoice ?? false;

    // Add tutor role to system message if not present
    let messages = [...body.messages];
    const hasSystemMessage = messages.some((msg) => msg.role === "system");

    if (!hasSystemMessage) {
      const systemPrompt = getSystemPromptForRole(tutorRole, useVoice);
      messages.unshift({
        role: "system",
        content: systemPrompt,
      });
    } else if (useVoice) {
      // If system message exists but we need to add voice instructions
      const systemMessageIndex = messages.findIndex(
        (msg) => msg.role === "system"
      );
      if (systemMessageIndex !== -1) {
        const currentSystemPrompt = messages[systemMessageIndex].content;
        if (!currentSystemPrompt.includes("speak using voice")) {
          messages[systemMessageIndex].content =
            addVoiceInstructionsToPrompt(currentSystemPrompt);
        }
      }
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
    });

    // Return the response
    return NextResponse.json({
      content: response.choices[0].message.content,
      model: response.model,
      usage: response.usage,
    });
  } catch (error: any) {
    console.error("OpenAI API error:", error);

    return NextResponse.json(
      {
        error: "Error processing request",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Add voice instructions to an existing system prompt
 */
function addVoiceInstructionsToPrompt(prompt: string): string {
  const voiceInstructions = `
When responding, remember you're speaking to the user through voice. Keep your responses conversational, clear, and concise. Pause naturally between thoughts using commas and periods. When explaining complex concepts or math problems, announce when you're writing something on the whiteboard, for example: "Let me show you this on the whiteboard. [writing] The formula for the area of a circle is A = πr². [/writing]"
`;

  return `${prompt}\n\n${voiceInstructions}`;
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
