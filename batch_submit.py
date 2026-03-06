#!/usr/bin/env python3
"""
Batch submission script for SmallGroupAssistant V0.1
Submits text-generation tasks to Claude Batch API for cost-effective processing.
Run: python3 batch_submit.py
"""

import json
import time
from anthropic import Anthropic

client = Anthropic()

# Task 1: React + Node.js Scaffold
TASK_1_PROMPT = """Generate a complete, production-ready scaffold for a React + Node.js application.

PROJECT: SmallGroupAssistant - AI Tutor for Small Groups

REQUIREMENTS:
- Frontend: React 18+ with TypeScript, Vite build tool
- Backend: Node.js with Express
- Integration: Anthropic Claude API
- Deployment: Netlify (frontend + functions)

OUTPUT FILES TO GENERATE (as separate code blocks):

1. **frontend/package.json** — React + Vite dependencies
2. **frontend/vite.config.ts** — Vite config
3. **frontend/tsconfig.json** — TypeScript config
4. **frontend/src/main.tsx** — Entry point
5. **frontend/src/App.tsx** — Root component
6. **frontend/src/index.css** — Base styles
7. **backend/package.json** — Express + dependencies
8. **backend/server.ts** — Express server setup
9. **backend/routes/ai.ts** — Claude API endpoint
10. **.gitignore** — Git ignore file
11. **netlify.toml** — Netlify deployment config
12. **README.md** — Quick start guide

STYLE:
- Use ESM (import/export)
- Include comments for key sections
- Provide install + run instructions
- Assume user has Node 18+, npm, Netlify CLI

DO NOT include actual AI logic yet (just API endpoint structure). This is the skeleton."""

# Task 3: Concept Explanation Prompt
TASK_3_PROMPT = """Engineer a high-quality prompt template for generating math concept explanations.

CONTEXT:
This prompt will be used by a small group of 3-5 middle/high school students learning with an AI tutor.
The tutor should explain concepts in a way that:
- Is accessible but not condescending
- Encourages group discussion
- Avoids just giving answers
- Relates to real-world applications
- Adapts to the group's prior knowledge

PROMPT TEMPLATE:
Create a system prompt + user-input template that an AI (Claude) will use to generate concept explanations.

The prompt should:
1. Define the AI's role (friendly tutor, guide, not authority)
2. Specify output format (structured explanation with sections)
3. Include quality checks (clarity, engagement, appropriateness)
4. Handle variation (difficulty levels: basic, intermediate, advanced)

EXAMPLE TOPICS TO TEST (include these as examples):
- Quadratic equations
- Systems of linear equations
- Exponential growth
- Probability and expected value

OUTPUT:
Provide the complete system prompt + example user input + example output for ONE topic (quadratic equations).
Format: Markdown with code blocks."""

def submit_batch():
    """Submit batch processing requests to Anthropic Batch API."""

    requests = [
        {
            "custom_id": "task_1_react_scaffold",
            "params": {
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 4000,
                "messages": [
                    {
                        "role": "user",
                        "content": TASK_1_PROMPT
                    }
                ]
            }
        },
        {
            "custom_id": "task_3_concept_prompt",
            "params": {
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 3000,
                "messages": [
                    {
                        "role": "user",
                        "content": TASK_3_PROMPT
                    }
                ]
            }
        }
    ]

    print("📤 Submitting batch tasks...")
    print(f"   - Task 1: React + Node.js Scaffold")
    print(f"   - Task 3: Concept Explanation Prompt")

    batch = client.messages.batches.create(requests=requests)

    print(f"\n✅ Batch submitted successfully!")
    print(f"   Batch ID: {batch.id}")
    print(f"   Status: {batch.processing_status}")
    print(f"\n🕐 Processing (usually 1-10 minutes)...")
    print(f"   Check status: python3 -c \"from batch_submit import check_batch; check_batch('{batch.id}')\"")

    # Optional: wait and retrieve if user wants
    return batch.id


def check_batch(batch_id: str):
    """Check batch status and retrieve results if complete."""
    batch = client.messages.batches.retrieve(batch_id)

    print(f"\n📊 Batch Status: {batch.processing_status}")
    print(f"   ID: {batch.id}")
    print(f"   Request count: {batch.request_counts.processing + batch.request_counts.succeeded + batch.request_counts.failed}")

    if batch.processing_status == "succeeded":
        print(f"\n✅ All tasks complete! Retrieving results...")
        results = client.messages.batches.results(batch_id)

        for result in results:
            task_id = result.custom_id
            message = result.message

            print(f"\n{'='*60}")
            print(f"📝 {task_id}")
            print(f"{'='*60}")

            if message.content:
                for block in message.content:
                    if hasattr(block, 'text'):
                        print(block.text)
    else:
        print(f"⏳ Still processing... check again in a few minutes.")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        # User provided batch ID to check
        check_batch(sys.argv[1])
    else:
        # Submit new batch
        batch_id = submit_batch()
