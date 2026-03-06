/**
 * Example Generator API Route
 * POST /api/examples - Generate step-by-step worked examples using Claude
 */

import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import {
  ExampleGeneratorRequest,
  ExampleGeneratorResponse,
  ApiResponse,
} from '../../src/types';

const router = Router();
const client = new Anthropic();

// Load the system prompt from prompts/example-generator.txt
function loadSystemPrompt(): string {
  try {
    // Try to load from the project root prompts directory
    const promptPath = path.join(__dirname, '../../prompts/example-generator.txt');
    if (fs.existsSync(promptPath)) {
      return fs.readFileSync(promptPath, 'utf-8');
    }
    // Fallback: return inline prompt
    return getInlineSystemPrompt();
  } catch (error) {
    console.warn('Failed to load prompt file, using inline prompt');
    return getInlineSystemPrompt();
  }
}

function getInlineSystemPrompt(): string {
  return `You are an expert mathematics tutor specializing in clear, step-by-step worked examples for small groups of learners (grades 6-12). Your goal is to help groups understand mathematical concepts through concrete, relatable examples.

## Your Core Responsibilities:
1. Generate a complete, solved worked example that demonstrates how to apply a mathematical concept
2. Break the solution into clear, logical steps
3. Explain the "why" behind each step, not just the "how"
4. Use real-world connections when relevant and helpful
5. Anticipate common mistakes and note where students often go wrong

## Guidelines for Examples:
- **Difficulty Alignment:** Tailor the problem complexity to the specified difficulty level:
  - Basic: Simple numbers, 2-3 step solutions, direct application
  - Intermediate: Multi-step problems, some conceptual reasoning, realistic contexts
  - Advanced: Complex relationships, multiple approaches possible, minimal scaffolding

- **Mathematical Notation:** Use clear, readable notation. When using symbols or notation that might be unfamiliar, briefly explain it.

- **Structure:** Always provide:
  1. **The Problem Statement** - Clear, specific, and realistic
  2. **Setup** - What we know, what we're finding, why this method applies
  3. **Step-by-Step Solution** - Each step numbered and explained
  4. **Real-World Connection** (when applicable) - Brief connection to something students care about
  5. **Common Mistake** - One thing students often get wrong with this type of problem

- **Tone:** Be encouraging and speak to the group directly. Avoid condescension. Treat them as capable thinkers.

## Output Format:
Return your response as a JSON object with this exact structure:
{
  "problemStatement": "The specific problem to solve",
  "setup": "Brief explanation of what we know and what method we'll use",
  "steps": [
    {
      "number": 1,
      "action": "What we're doing in this step",
      "work": "The actual mathematical work (use clear notation)",
      "explanation": "Why we do this step / what it means"
    }
  ],
  "realWorldConnection": "Optional brief connection to something meaningful",
  "commonMistake": "One error students often make and why it happens",
  "keyTakeaway": "The most important concept for this example"
}`;
}

/**
 * POST /api/examples
 * Generates a step-by-step worked example using Claude
 */
router.post(
  '/',
  async (req: Request, res: Response<ApiResponse<ExampleGeneratorResponse>>) => {
    try {
      const { topic, question, difficultyLevel } =
        req.body as ExampleGeneratorRequest;

      // Validation
      if (!topic || !question) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Missing required fields: topic and question',
            code: 'INVALID_REQUEST',
          },
        });
      }

      if (
        difficultyLevel &&
        !['basic', 'intermediate', 'advanced'].includes(difficultyLevel)
      ) {
        return res.status(400).json({
          success: false,
          error: {
            message:
              'Invalid difficulty level. Must be "basic", "intermediate", or "advanced"',
            code: 'INVALID_REQUEST',
          },
        });
      }

      const level = difficultyLevel || 'intermediate';

      // Build the user prompt
      const userPrompt = `
Generate a worked example for a small group of students.

**Topic:** ${topic}
**Group's Question:** ${question}
**Difficulty Level:** ${level}

Create a clear, step-by-step example that addresses their question directly.
`;

      // Call Claude API
      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: loadSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      // Extract the text response
      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '';

      // Parse JSON from response
      let exampleData: ExampleGeneratorResponse;
      try {
        // Try to extract JSON from the response (in case Claude added extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        exampleData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse Claude response:', responseText);
        return res.status(500).json({
          success: false,
          error: {
            message:
              'Failed to parse example response from Claude. Please try again.',
            code: 'PARSING_ERROR',
            details: parseError instanceof Error ? parseError.message : undefined,
          },
        });
      }

      // Validate the parsed data
      if (
        !exampleData.problemStatement ||
        !exampleData.steps ||
        !Array.isArray(exampleData.steps)
      ) {
        return res.status(500).json({
          success: false,
          error: {
            message: 'Invalid example format returned from Claude',
            code: 'PARSING_ERROR',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: exampleData,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('403')) {
          return res.status(401).json({
            success: false,
            error: {
              message: 'Claude API authentication failed. Check your API key.',
              code: 'API_ERROR',
            },
          });
        }

        if (error.message.includes('429')) {
          return res.status(429).json({
            success: false,
            error: {
              message: 'Rate limit exceeded. Please try again in a moment.',
              code: 'RATE_LIMIT',
            },
          });
        }

        return res.status(500).json({
          success: false,
          error: {
            message: `API Error: ${error.message}`,
            code: 'API_ERROR',
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'API_ERROR',
        },
      });
    }
  }
);

export default router;
