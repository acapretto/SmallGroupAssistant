import { useState, useCallback, useRef } from "react";

interface HintRequest {
  problemText: string;
  userAttempt: string;
  hintLevel: 1 | 2 | 3;
}

interface HintData {
  hint: string;
  type: "question" | "hint" | "explanation";
  level: 1 | 2 | 3;
  keyMessage: string;
}

interface UseHintsReturn {
  getHint: (request: HintRequest) => Promise<void>;
  hints: {
    1?: HintData;
    2?: HintData;
    3?: HintData;
  };
  loading: boolean;
  error: string | null;
}

/**
 * useHints Hook
 * Manages hint state and API calls with throttling to prevent spam requests
 *
 * Features:
 * - Throttles hint requests (min 2 seconds between requests)
 * - Caches hints (Level 1, 2, 3) during a session
 * - Tracks loading and error states
 * - Prevents duplicate requests for the same level
 */
export const useHints = (): UseHintsReturn => {
  const [hints, setHints] = useState<{
    1?: HintData;
    2?: HintData;
    3?: HintData;
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Throttle state: track last request time per level
  const lastRequestTime = useRef<{ 1?: number; 2?: number; 3?: number }>({});
  const THROTTLE_DELAY_MS = 2000; // 2 seconds minimum between requests

  const getHint = useCallback(async (request: HintRequest) => {
    const { hintLevel } = request;

    // Check if we already have this hint cached
    if (hints[hintLevel]) {
      console.log(`Hint Level ${hintLevel} already retrieved, using cache`);
      return;
    }

    // Throttle check: prevent requests within THROTTLE_DELAY_MS
    const now = Date.now();
    const lastTime = lastRequestTime.current[hintLevel] || 0;
    if (now - lastTime < THROTTLE_DELAY_MS) {
      const waitTime = Math.ceil((THROTTLE_DELAY_MS - (now - lastTime)) / 1000);
      setError(`Please wait ${waitTime}s before requesting another hint`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/hints/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const hintData: HintData = await response.json();

      // Validate response
      if (!hintData.hint || !hintData.type || hintData.level !== hintLevel) {
        throw new Error("Invalid hint response format");
      }

      // Store hint in state
      setHints((prev) => ({
        ...prev,
        [hintLevel]: hintData,
      }));

      // Update throttle timestamp
      lastRequestTime.current[hintLevel] = now;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching hint:", err);
    } finally {
      setLoading(false);
    }
  }, [hints]);

  return { getHint, hints, loading, error };
};

export default useHints;
