/**
 * useSessionStorage.ts
 * Hook for managing sessions in localStorage
 */

import { useState, useCallback, useEffect } from "react";
import { Session } from "../types/session";

const STORAGE_KEY = "smallgroup_sessions";

interface UseSessionStorageReturn {
  sessions: Session[];
  loading: boolean;
  addSession: (session: Session) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  getSession: (id: string) => Session | null;
  clearAll: () => void;
}

export const useSessionStorage = (): UseSessionStorageReturn => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Load sessions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Parse dates
        const sessionsWithDates = Object.values(parsed).map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
          hintsRequested: session.hintsRequested.map((hint: any) => ({
            ...hint,
            timestamp: new Date(hint.timestamp),
          })),
        }));

        setSessions(sessionsWithDates);
      }
    } catch (error) {
      console.error("Failed to load sessions from storage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save sessions to localStorage whenever they change
  const saveSessions = useCallback((newSessions: Session[]) => {
    try {
      const sessionsMap = newSessions.reduce(
        (acc, session) => {
          acc[session.id] = session;
          return acc;
        },
        {} as Record<string, Session>
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsMap));
    } catch (error) {
      console.error("Failed to save sessions to storage:", error);
    }
  }, []);

  const addSession = useCallback(
    (session: Session) => {
      setSessions((prev) => {
        const updated = [...prev, session];
        saveSessions(updated);
        return updated;
      });
    },
    [saveSessions]
  );

  const updateSession = useCallback(
    (id: string, updates: Partial<Session>) => {
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        );
        saveSessions(updated);
        return updated;
      });
    },
    [saveSessions]
  );

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const updated = prev.filter((s) => s.id !== id);
        saveSessions(updated);
        return updated;
      });
    },
    [saveSessions]
  );

  const getSession = useCallback(
    (id: string) => {
      return sessions.find((s) => s.id === id) || null;
    },
    [sessions]
  );

  const clearAll = useCallback(() => {
    setSessions([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    sessions,
    loading,
    addSession,
    updateSession,
    deleteSession,
    getSession,
    clearAll,
  };
};

export default useSessionStorage;
