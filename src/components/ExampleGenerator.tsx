/**
 * ExampleGenerator Component
 * Displays a button to generate worked examples, shows loading state,
 * displays formatted results with copy functionality
 */

import React, { useState } from 'react';
import { generateExample } from '../services/apiClient';
import {
  ExampleGeneratorRequest,
  ExampleGeneratorResponse,
  DifficultyLevel,
} from '../types';
import './ExampleGenerator.css';

interface Props {
  topic?: string;
  question?: string;
  onExampleGenerated?: (example: ExampleGeneratorResponse) => void;
}

export const ExampleGenerator: React.FC<Props> = ({
  topic: initialTopic = '',
  question: initialQuestion = '',
  onExampleGenerated,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [question, setQuestion] = useState(initialQuestion);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [example, setExample] = useState<ExampleGeneratorResponse | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerateExample = async () => {
    // Validation
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    if (!question.trim()) {
      setError('Please enter your question');
      return;
    }

    setLoading(true);
    setError(null);
    setExample(null);

    try {
      const request: ExampleGeneratorRequest = {
        topic: topic.trim(),
        question: question.trim(),
        difficultyLevel: difficulty,
      };

      const result = await generateExample(request);

      // Check if result is an error
      if ('code' in result && !('problemStatement' in result)) {
        setError(result.message);
        return;
      }

      // Result is a valid ExampleGeneratorResponse
      setExample(result as ExampleGeneratorResponse);
      if (onExampleGenerated) {
        onExampleGenerated(result as ExampleGeneratorResponse);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate example'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyStepToClipboard = (stepIndex: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(stepIndex);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <div className="example-generator">
      <div className="example-generator__form">
        <div className="example-generator__field">
          <label htmlFor="topic" className="example-generator__label">
            Mathematical Topic
          </label>
          <input
            id="topic"
            type="text"
            placeholder="e.g., Quadratic Formula, Systems of Equations"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="example-generator__input"
            disabled={loading}
          />
        </div>

        <div className="example-generator__field">
          <label htmlFor="question" className="example-generator__label">
            Your Question
          </label>
          <textarea
            id="question"
            placeholder="e.g., How do I know when to use the quadratic formula?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="example-generator__textarea"
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="example-generator__field">
          <label htmlFor="difficulty" className="example-generator__label">
            Difficulty Level
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
            className="example-generator__select"
            disabled={loading}
          >
            <option value="basic">Basic</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <button
          onClick={handleGenerateExample}
          disabled={loading}
          className="example-generator__button"
        >
          {loading ? (
            <>
              <span className="example-generator__spinner"></span>
              Generating...
            </>
          ) : (
            'Show Me An Example'
          )}
        </button>
      </div>

      {error && (
        <div className="example-generator__error">
          <p className="example-generator__error-text">{error}</p>
        </div>
      )}

      {example && (
        <div className="example-generator__result">
          <div className="example-generator__result-header">
            <h2 className="example-generator__result-title">Your Example</h2>
          </div>

          <section className="example-generator__section">
            <h3 className="example-generator__section-title">Problem</h3>
            <p className="example-generator__problem-statement">
              {example.problemStatement}
            </p>
          </section>

          <section className="example-generator__section">
            <h3 className="example-generator__section-title">Setup</h3>
            <p className="example-generator__text">{example.setup}</p>
          </section>

          <section className="example-generator__section">
            <h3 className="example-generator__section-title">Solution</h3>
            <div className="example-generator__steps">
              {example.steps.map((step, index) => (
                <div key={index} className="example-generator__step">
                  <div className="example-generator__step-header">
                    <span className="example-generator__step-number">
                      Step {step.number}
                    </span>
                    <span className="example-generator__step-action">
                      {step.action}
                    </span>
                  </div>

                  <div className="example-generator__step-work">
                    <code>{step.work}</code>
                  </div>

                  <p className="example-generator__step-explanation">
                    {step.explanation}
                  </p>

                  <button
                    onClick={() =>
                      copyStepToClipboard(
                        index,
                        `${step.action}\n${step.work}\n${step.explanation}`
                      )
                    }
                    className={`example-generator__copy-button ${
                      copiedIndex === index
                        ? 'example-generator__copy-button--copied'
                        : ''
                    }`}
                    title="Copy step to clipboard"
                  >
                    {copiedIndex === index ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {example.realWorldConnection && (
            <section className="example-generator__section">
              <h3 className="example-generator__section-title">
                Real-World Connection
              </h3>
              <p className="example-generator__text">
                {example.realWorldConnection}
              </p>
            </section>
          )}

          <section className="example-generator__section">
            <h3 className="example-generator__section-title">
              Common Mistake
            </h3>
            <div className="example-generator__callout example-generator__callout--warning">
              <p className="example-generator__text">
                {example.commonMistake}
              </p>
            </div>
          </section>

          <section className="example-generator__section">
            <h3 className="example-generator__section-title">Key Takeaway</h3>
            <div className="example-generator__callout example-generator__callout--highlight">
              <p className="example-generator__text">
                {example.keyTakeaway}
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ExampleGenerator;
