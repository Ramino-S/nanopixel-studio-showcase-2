/**
 * Centralized Logging Service for NanoPixel Studio 24.
 *
 * Stores structured log entries in memory + localStorage.
 * Provides filtering, export, and a reactive subscription model
 * so the UI can display logs in real time.
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  source: string;       // e.g. "OpenRouter", "Gemini", "Fal", "App"
  message: string;
  details?: unknown;     // request body, response data, error object, etc.
}

const STORAGE_KEY = 'nanopixel_logs';
const MAX_ENTRIES = 500;

let logs: LogEntry[] = [];
let listeners: Array<() => void> = [];

// ── Persistence ──────────────────────────────────────────────

const loadFromStorage = (): void => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      logs = JSON.parse(raw);
    }
  } catch {
    logs = [];
  }
};

const saveToStorage = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // localStorage full — silently drop oldest half
    logs = logs.slice(logs.length / 2);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch { /* give up */ }
  }
};

// Initialize on module load
loadFromStorage();

// ── Subscriptions (for reactive UI) ─────────────────────────

export const subscribe = (listener: () => void): (() => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

const notify = (): void => {
  listeners.forEach(l => l());
};

// ── Core API ─────────────────────────────────────────────────

const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const addEntry = (level: LogLevel, source: string, message: string, details?: unknown): LogEntry => {
  const entry: LogEntry = {
    id: generateId(),
    timestamp: Date.now(),
    level,
    source,
    message,
    details,
  };

  logs.push(entry);

  // Auto-rotate: keep only last MAX_ENTRIES
  if (logs.length > MAX_ENTRIES) {
    logs = logs.slice(logs.length - MAX_ENTRIES);
  }

  saveToStorage();
  notify();

  // Also mirror to browser console for convenience
  const consoleFn =
    level === LogLevel.ERROR ? console.error :
    level === LogLevel.WARN ? console.warn :
    level === LogLevel.DEBUG ? console.debug :
    console.info;

  consoleFn(`[${source}] ${message}`, details ?? '');

  return entry;
};

export const debug = (source: string, message: string, details?: unknown) =>
  addEntry(LogLevel.DEBUG, source, message, details);

export const info = (source: string, message: string, details?: unknown) =>
  addEntry(LogLevel.INFO, source, message, details);

export const warn = (source: string, message: string, details?: unknown) =>
  addEntry(LogLevel.WARN, source, message, details);

export const error = (source: string, message: string, details?: unknown) =>
  addEntry(LogLevel.ERROR, source, message, details);

// ── Querying ─────────────────────────────────────────────────

export const getLogs = (): ReadonlyArray<LogEntry> => logs;

export const getLogsByLevel = (level: LogLevel): LogEntry[] =>
  logs.filter(l => l.level === level);

export const getLogsBySource = (source: string): LogEntry[] =>
  logs.filter(l => l.source === source);

export const clearLogs = (): void => {
  logs = [];
  saveToStorage();
  notify();
};

// ── Export ────────────────────────────────────────────────────

export const exportLogsAsText = (): string => {
  return logs.map(entry => {
    const date = new Date(entry.timestamp).toLocaleString('ru-RU');
    const detailStr = entry.details
      ? `\n   Details: ${JSON.stringify(entry.details, null, 2)}`
      : '';
    return `[${date}] [${entry.level}] [${entry.source}] ${entry.message}${detailStr}`;
  }).join('\n\n');
};

export const exportLogsAsJSON = (): string => {
  return JSON.stringify(logs, null, 2);
};

export const downloadLogs = (format: 'txt' | 'json' = 'txt'): void => {
  const content = format === 'json' ? exportLogsAsJSON() : exportLogsAsText();
  const mimeType = format === 'json' ? 'application/json' : 'text/plain';
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nanopixel-logs-${new Date().toISOString().slice(0, 10)}.${format}`;
  a.click();
  URL.revokeObjectURL(url);
};
