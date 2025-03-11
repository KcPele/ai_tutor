import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export type AITutorRole =
  | "math"
  | "science"
  | "history"
  | "language"
  | "general";

interface ChatOptions {
  messages: ChatCompletionMessageParam[];
  model?: string;
  temperature?: number;
  tutorRole?: AITutorRole;
  useVoice?: boolean;
}

/**
 * Generate a chat completion response from OpenAI via our API endpoint
 */
export async function generateChatCompletion({
  messages,
  model = "gpt-4o",
  temperature = 0.7,
  tutorRole = "general",
  useVoice = false,
}: ChatOptions): Promise<string | null> {
  try {
    // Call our API endpoint instead of OpenAI directly
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        model,
        temperature,
        tutorRole,
        useVoice,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error generating chat completion:", error);
    throw new Error("Failed to generate AI response");
  }
}

/**
 * Parse AI response text to extract any whiteboard writing instructions
 * @param response The AI response text
 * @returns An object with parsed text and writing instructions
 */
export function parseAIResponse(response: string): {
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
      // Position will be assigned by the whiteboard component
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
