import OpenAI from "openai";
import {
  FOLLOW_UP_QUESTIONS_PROMPT,
  METADATA_EXTRACTION_PROMPT,
  buildFollowUpUserMessage,
  buildMetadataUserMessage,
} from "./prompts";

// ===== AI Provider Interface =====

export interface AIProvider {
  generateFollowUpQuestions(storyText: string): Promise<string[]>;
  extractMetadata(storyText: string): Promise<ExtractedMetadata>;
  generateEmbedding(text: string): Promise<number[]>;
}

export interface ExtractedMetadata {
  themes: string[];
  timePeriod: string | null;
  lifeStage: string | null;
  places: string[];
  people: string[];
  emotionalTone: string | null;
  keywords: string[];
}

// ===== OpenAI Implementation =====

class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateFollowUpQuestions(storyText: string): Promise<string[]> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: FOLLOW_UP_QUESTIONS_PROMPT },
        { role: "user", content: buildFollowUpUserMessage(storyText) },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content || "";

    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.questions)) {
        return parsed.questions;
      }
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Fallback: split by newlines
      return content
        .split("\n")
        .map((line) => line.replace(/^\d+[\.\)]\s*/, "").trim())
        .filter((line) => line.length > 10 && line.endsWith("?"));
    }

    return [];
  }

  async extractMetadata(storyText: string): Promise<ExtractedMetadata> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: METADATA_EXTRACTION_PROMPT },
        { role: "user", content: buildMetadataUserMessage(storyText) },
      ],
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";

    try {
      const parsed = JSON.parse(content);
      return {
        themes: parsed.themes || [],
        timePeriod: parsed.time_period || null,
        lifeStage: parsed.life_stage || null,
        places: parsed.places || [],
        people: parsed.people || [],
        emotionalTone: parsed.emotional_tone || null,
        keywords: parsed.keywords || [],
      };
    } catch {
      return {
        themes: [],
        timePeriod: null,
        lifeStage: null,
        places: [],
        people: [],
        emotionalTone: null,
        keywords: [],
      };
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000), // Stay within token limits
    });

    return response.data[0].embedding;
  }
}

// ===== Singleton =====

let providerInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!providerInstance) {
    providerInstance = new OpenAIProvider();
  }
  return providerInstance;
}
