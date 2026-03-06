/**
 * problems.ts - Routes for practice problem generation and grading
 * Handles problem generation via Claude and auto-grading of student answers
 */

import express, { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";

const router = Router();
const client = new Anthropic();

// Load prompt templates
function loadPrompt(filename: string): string {
  const promptPath = path.join(__dirname, "..", "..", "prompts", filename);
  return fs.readFileSync(promptPath, "utf-8");
}

interface Problem {
  id: string;
  problemText: string;
  correctAnswer: string;
  hints: string[];
  topic?: string;
  difficultyLevel?: string;
}

interface GenerationPayload {
  topic: string;
  count: number;
  difficultyLevel: string;
}

interface CheckAnswerPayload {
  problemId: string;
  userAnswer: string;
  problemText: string;
  correctAnswer: string;
}

/**
 * POST /api/problems/generate
 * Generate 3-5 math problems on a given topic at a specified difficulty level
 */
router.post(
  "/generate",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { topic, count, difficultyLevel }: GenerationPayload = req.body;

      // Validation
      if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
        res.status(400).json({ error: "Topic is required and must be a string" });
        return;
      }

      if (!Number.isInteger(count) || count < 3 || count > 5) {
        res
          .status(400)
          .json({ error: "Count must be an integer between 3 and 5" });
        return;
      }

      if (
        !difficultyLevel ||
        !["easy", "medium", "hard"].includes(difficultyLevel.toLowerCase())
      ) {
        res
          .status(400)
          .json({
            error:
              'DifficultyLevel must be "easy", "medium", or "hard"',
          });
        return;
      }

      // Load and prepare prompt
      let promptTemplate = loadPrompt("problem-generator.txt");
      promptTemplate = promptTemplate
        .replace("TOPIC", topic)
        .replace("DIFFICULTY_LEVEL", difficultyLevel.toLowerCase())
        .replace(/COUNT/g, count.toString());

      // Call Claude to generate problems
      const message = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: promptTemplate,
          },
        ],
      });

      const responseText =
        message.content[0].type === "text" ? message.content[0].text : "";

      // Parse JSON response
      let parsedResponse;
      try {
        // Extract JSON from the response (may be wrapped in markdown code blocks)
        const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
        const jsonString = jsonMatch ? jsonMatch[1] : responseText;
        parsedResponse = JSON.parse(jsonString);
      } catch (parseError) {
        res.status(500).json({
          error: "Failed to parse Claude response as JSON",
          details: responseText.substring(0, 200),
        });
        return;
      }

      // Validate and enhance problems
      if (!parsedResponse.problems || !Array.isArray(parsedResponse.problems)) {
        res.status(500).json({
          error: "Claude response missing 'problems' array",
        });
        return;
      }

      const problems: Problem[] = parsedResponse.problems.map(
        (problem: any, index: number) => ({
          id: problem.id || `problem_${index + 1}`,
          problemText: problem.problemText || "",
          correctAnswer: problem.correctAnswer || "",
          hints: problem.hints || [
            "What concept applies here?",
            "Try breaking it into steps.",
            "Check your work so far.",
          ],
          topic,
          difficultyLevel,
        })
      );

      // Validate all problems have required fields
      const validProblems = problems.every(
        (p) => p.problemText && p.correctAnswer
      );
      if (!validProblems) {
        res.status(500).json({
          error: "Generated problems missing required fields",
        });
        return;
      }

      res.status(200).json({
        problems,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error generating problems:", error);
      res.status(500).json({
        error: "Failed to generate problems",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
);

/**
 * POST /api/problems/check-answer
 * Auto-grade a student's answer using Claude
 */
router.post(
  "/check-answer",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        problemId,
        userAnswer,
        problemText,
        correctAnswer,
      }: CheckAnswerPayload = req.body;

      // Validation
      if (!problemId || typeof problemId !== "string") {
        res.status(400).json({ error: "ProblemId is required" });
        return;
      }

      if (
        userAnswer === undefined ||
        userAnswer === null ||
        userAnswer.toString().trim().length === 0
      ) {
        res
          .status(400)
          .json({
            error: "UserAnswer is required and cannot be empty",
          });
        return;
      }

      if (!problemText || typeof problemText !== "string") {
        res.status(400).json({ error: "ProblemText is required" });
        return;
      }

      if (!correctAnswer) {
        res.status(400).json({ error: "CorrectAnswer is required" });
        return;
      }

      // Load and prepare grading prompt
      let promptTemplate = loadPrompt("problem-grader.txt");
      promptTemplate = promptTemplate
        .replace("PROBLEM_TEXT", problemText)
        .replace("CORRECT_ANSWER", correctAnswer.toString())
        .replace("USER_ANSWER", userAnswer.toString());

      // Call Claude to grade answer
      const message = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: promptTemplate,
          },
        ],
      });

      const responseText =
        message.content[0].type === "text" ? message.content[0].text : "";

      // Parse JSON response
      let gradeResponse;
      try {
        // Extract JSON from response (may be wrapped in markdown)
        const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
        const jsonString = jsonMatch ? jsonMatch[1] : responseText;
        gradeResponse = JSON.parse(jsonString);
      } catch (parseError) {
        res.status(500).json({
          error: "Failed to parse grading response",
          details: responseText.substring(0, 200),
        });
        return;
      }

      // Validate grading response
      if (
        typeof gradeResponse.correct !== "boolean" ||
        !gradeResponse.feedback
      ) {
        res.status(500).json({
          error: "Invalid grading response format",
        });
        return;
      }

      res.status(200).json({
        problemId,
        correct: gradeResponse.correct,
        feedback: gradeResponse.feedback,
        explanation: gradeResponse.explanation || undefined,
        hint: gradeResponse.hint || undefined,
        gradedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error checking answer:", error);
      res.status(500).json({
        error: "Failed to grade answer",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
);

/**
 * GET /api/problems/health
 * Health check endpoint
 */
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "problems-api",
    timestamp: new Date().toISOString(),
  });
});

export default router;
