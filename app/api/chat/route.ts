import { NextRequest, NextResponse } from "next/server";
import openai from "@/utils/openai/client";
import { AITutorRole } from "@/utils/openai/chat";

// Define the request body type
interface RequestBody {
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  system_instruction?: string;
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
    const maxTokens = body.max_tokens ?? 4000;
    const shouldStream = body.stream ?? false;

    // Prepare messages
    let messages = [...body.messages];

    // Add system instruction if provided
    if (body.system_instruction && messages[0]?.role === "system") {
      messages[0].content = `${messages[0].content}\n\n${body.system_instruction}`;
    }

    // Call OpenAI API without streaming for simplicity
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    });

    return NextResponse.json({
      content: response.choices[0].message.content,
      model: response.model,
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
