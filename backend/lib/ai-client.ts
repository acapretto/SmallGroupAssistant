/**
 * ai-client.ts - Shared Claude API client for the application
 * Handles all interactions with Claude API with consistent configuration
 */

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AICompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";
const DEFAULT_MAX_TOKENS = 2048;
const DEFAULT_TEMPERATURE = 0.7;

/**
 * Send a message to Claude and get a response
 * @param message The user message/prompt
 * @param options Configuration options
 * @returns The text response from Claude
 */
export async function chatComplete(
  message: string,
  options: AICompletionOptions = {}
): Promise<string> {
  const {
    model = DEFAULT_MODEL,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
  } = options;

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
  });

  if (response.content[0].type === "text") {
    return response.content[0].text;
  }

  throw new Error("Unexpected response type from Claude");
}

/**
 * Send a message with conversation history
 * Useful for multi-turn conversations
 */
export async function chatWithHistory(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  options: AICompletionOptions = {}
): Promise<string> {
  const {
    model = DEFAULT_MODEL,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
  } = options;

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    messages,
  });

  if (response.content[0].type === "text") {
    return response.content[0].text;
  }

  throw new Error("Unexpected response type from Claude");
}

export default client;
