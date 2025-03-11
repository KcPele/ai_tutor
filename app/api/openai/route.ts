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

    // Add tutor role to system message if not present
    let messages = [...body.messages];
    const hasSystemMessage = messages.some((msg) => msg.role === "system");

    if (!hasSystemMessage) {
      const systemPrompt = getSystemPromptForRole(tutorRole);
      messages.unshift({
        role: "system",
        content: systemPrompt,
      });
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
 * Get the system prompt based on the tutor role
 */
function getSystemPromptForRole(role: AITutorRole): string {
  const basePrompt =
    "You are an AI tutor specialized in teaching students. Explain concepts clearly and provide step-by-step explanations.";

  switch (role) {
    case "math":
      return `${basePrompt} You excel at explaining mathematical concepts, formulas, and problem-solving techniques. Use the whiteboard to demonstrate mathematical steps clearly.`;

    case "science":
      return `${basePrompt} You are knowledgeable in scientific principles and theories. Use the whiteboard to illustrate scientific concepts with diagrams and explanations.`;

    case "history":
      return `${basePrompt} You specialize in historical events, timelines, and connections between historical periods. Use the whiteboard to create timelines and highlight key historical events.`;

    case "language":
      return `${basePrompt} You excel at explaining grammar rules, literary analysis, and language learning techniques. Use the whiteboard to diagram sentences or explain language patterns.`;

    case "general":
    default:
      return `${basePrompt} You can explain a wide range of subjects and concepts adaptively based on student needs. Use the whiteboard to visualize important information.`;
  }
}
