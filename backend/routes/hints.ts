import Anthropic from "@anthropic-ai/sdk";
import { Router, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";

const router = Router();

// Initialize Anthropic client
const client = new Anthropic();

// Types
interface HintRequest {
  problemText: string;
  userAttempt: string;
  hintLevel: 1 | 2 | 3;
}

interface HintResponse {
  hint: string;
  type: "question" | "hint" | "explanation";
  level: 1 | 2 | 3;
  keyMessage: string;
}

// Load Socratic hints system prompt
function loadSystemPrompt(): string {
  const promptPath = path.join(
    __dirname,
    "../../prompts/socratic-hints.txt"
  );
  try {
    return fs.readFileSync(promptPath, "utf-8");
  } catch (error) {
    console.error("Failed to load socratic-hints.txt:", error);
    // Fallback system prompt if file not found
    return `You are an expert Socratic tutor. Ask questions that guide students toward understanding without giving answers.
    For Level 1: Ask open questions about their process.
    For Level 2: Name a relevant strategy and ask how it applies.
    For Level 3: Provide detailed explanation, stopping before the final answer.`;
  }
}

/**
 * POST /api/hints/get
 * Generates a Socratic hint for a stuck student
 */
router.post("/get", async (req: Request, res: Response) => {
  try {
    const { problemText, userAttempt, hintLevel } = req.body as HintRequest;

    // Validate inputs
    if (!problemText || !userAttempt || !hintLevel) {
      return res.status(400).json({
        error: "Missing required fields: problemText, userAttempt, hintLevel",
      });
    }

    if (![1, 2, 3].includes(hintLevel)) {
      return res.status(400).json({
        error: "hintLevel must be 1, 2, or 3",
      });
    }

    // Build user prompt based on hint level
    const levelDescriptions = {
      1: "Open question (gentle entry, ask about their process, NO mathematical content)",
      2: "Guided hint (name a strategy/property and ask how it applies)",
      3: "Detailed explanation (work through most of the problem, stop before final answer)",
    };

    const userPrompt = `
Problem:
${problemText}

Student's Attempt So Far:
${userAttempt || "(Student hasn't started or shared their work)"}

Generate a Level ${hintLevel} hint: ${levelDescriptions[hintLevel]}

Remember:
- For Level 1: Ask about their first steps or strategy. Don't reference math yet.
- For Level 2: Name the relevant strategy/property and ask how it applies.
- For Level 3: Explain the reasoning and work through most of it, but stop before the final answer.

Respond ONLY with valid JSON (no markdown, no code blocks) matching this structure:
{
  "hint": "The actual hint text",
  "type": "question|hint|explanation",
  "level": ${hintLevel},
  "keyMessage": "Brief summary of the core idea"
}
`;

    // Call Claude API
    const systemPrompt = loadSystemPrompt();
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Extract text from response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON response
    let parsedResponse: HintResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Claude response:", responseText);
      return res.status(500).json({
        error: "Failed to parse hint response",
        debug: responseText,
      });
    }

    // Validate response structure
    if (!parsedResponse.hint || !parsedResponse.type || !parsedResponse.level) {
      return res.status(500).json({
        error: "Invalid hint response structure",
        debug: parsedResponse,
      });
    }

    // Return hint to client
    return res.json(parsedResponse);
  } catch (error) {
    console.error("Error in /api/hints/get:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/hints/track
 * Logs hint usage for teacher analytics (optional)
 * Used to track how many hints each student requests
 */
router.post("/track", async (req: Request, res: Response) => {
  try {
    const {
      groupId,
      studentName,
      problemId,
      hintLevel,
      timestamp,
    } = req.body;

    // Validate inputs
    if (!groupId || !studentName || !problemId || !hintLevel) {
      return res.status(400).json({
        error:
          "Missing required fields: groupId, studentName, problemId, hintLevel",
      });
    }

    // TODO: In a full implementation, this would save to a database
    // For now, just log and confirm
    console.log(`[HINT TRACKED] ${studentName} requested Level ${hintLevel} hint for problem ${problemId} in group ${groupId} at ${timestamp}`);

    return res.json({
      success: true,
      message: "Hint usage logged",
    });
  } catch (error) {
    console.error("Error in /api/hints/track:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
