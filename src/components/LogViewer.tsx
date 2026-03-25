/**
 * LogViewer - Real-time log streaming component using Server-Sent Events
 *
 * Connects to the backend SSE endpoint at /api/task-runs/{id}/logs/stream
 * Supports log level filtering, auto-scroll, and connection status display.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Radio, Pause, Play, Trash2, ArrowDown } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  metadata?: Record<string, unknown>;
}

type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'ended' | 'error';

interface LogViewerProps {
  taskRunId: string;
  className?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LEVEL_COLORS: Record<string, string> = {
  DEBUG: 'text-gray-400',
  INFO: 'text-blue-400',
  WARNING: 'text-yellow-400',
  ERROR: 'text-red-400',
  CRITICAL: 'text-red-500 font-bold',
};

const LEVEL_BG: Record<string, string> = {
  DEBUG: '',
  INFO: '',
  WARNING: 'bg-yellow-900/10',
  ERROR: 'bg-red-900/20',
  CRITICAL: 'bg-red-900/30',
};

const STATUS_DISPLAY: Record<ConnectionStatus, { label: string; color: string }> = {
  disconnected: { label: 'Disconnected', color: 'text-gray-400' },
  connecting: { label: 'Connecting...', color: 'text-yellow-400' },
  connected: { label: 'Live', color: 'text-green-400' },
  ended: { label: 'Stream ended', color: 'text-gray-400' },
  error: { label: 'Error', color: 'text-red-400' },
};

export function LogViewer({ taskRunId, className = '' }: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [levelFilter, setLevelFilter] = useState<LogLevel>('INFO');
  const [autoScroll, setAutoScroll] = useState(true);
  const [paused, setPaused] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const scrollToBottom = useCallback(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autoScroll]);

  // Auto-scroll when new logs arrive
  useEffect(() => {
    scrollToBottom();
  }, [logs, scrollToBottom]);

  // Detect manual scroll to disable auto-scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  }, []);

  // Connect to SSE stream
  useEffect(() => {
    if (paused || !taskRunId) return;

    const url = `${API_BASE_URL}/api/task-runs/${taskRunId}/logs/stream?level=${levelFilter}`;
    setStatus('connecting');

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('log', (event) => {
      try {
        const logEntry: LogEntry = JSON.parse(event.data);
        setLogs((prev) => [...prev, logEntry]);
      } catch {
        // Skip malformed log entries
      }
    });

    eventSource.addEventListener('status', () => {
      setStatus('connected');
    });

    eventSource.addEventListener('end', () => {
      setStatus('ended');
      eventSource.close();
    });

    eventSource.addEventListener('error', () => {
      setStatus('error');
    });

    eventSource.onopen = () => {
      setStatus('connected');
    };

    eventSource.onerror = () => {
      if (eventSource.readyState === EventSource.CLOSED) {
        setStatus('ended');
      } else {
        setStatus('error');
      }
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [taskRunId, levelFilter, paused]);

  const handleClear = () => {
    setLogs([]);
  };

  const handleTogglePause = () => {
    if (paused) {
      setPaused(false);
    } else {
      setPaused(true);
      eventSourceRef.current?.close();
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 3 });
    } catch {
      return ts;
    }
  };

  const statusInfo = STATUS_DISPLAY[status];

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className={`flex items-center gap-1.5 text-xs font-medium ${statusInfo.color}`}>
            <Radio size={12} className={status === 'connected' ? 'animate-pulse' : ''} />
            {statusInfo.label}
          </div>

          {/* Log count */}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {logs.length} entries
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Level filter */}
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value as LogLevel);
              setLogs([]); // Clear on filter change since SSE reconnects
            }}
            className="px-2 py-1 text-xs border border-gray-600 rounded bg-gray-800 text-gray-200"
          >
            <option value="DEBUG">DEBUG</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
          </select>

          {/* Pause/Resume */}
          <button
            onClick={handleTogglePause}
            className={`p-1.5 rounded text-xs transition-colors ${
              paused
                ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={paused ? 'Resume' : 'Pause'}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            className="p-1.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            title="Clear logs"
          >
            <Trash2 size={14} />
          </button>

          {/* Scroll to bottom */}
          {!autoScroll && (
            <button
              onClick={() => {
                setAutoScroll(true);
                logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-1.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
              title="Scroll to bottom"
            >
              <ArrowDown size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Log content */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="bg-gray-950 rounded-lg p-4 overflow-auto max-h-[600px] min-h-[300px] font-mono text-xs leading-5"
      >
        {logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {status === 'connecting'
              ? 'Connecting to log stream...'
              : status === 'connected'
              ? 'Waiting for log entries...'
              : status === 'ended'
              ? 'Stream ended — no more logs'
              : paused
              ? 'Stream paused'
              : 'No logs available'}
          </div>
        ) : (
          logs.map((entry, index) => (
            <div
              key={index}
              className={`flex gap-3 py-0.5 px-1 rounded ${LEVEL_BG[entry.level] || ''}`}
            >
              <span className="text-gray-500 shrink-0 select-none">
                {formatTimestamp(entry.timestamp)}
              </span>
              <span className={`shrink-0 w-[60px] text-right ${LEVEL_COLORS[entry.level] || 'text-gray-400'}`}>
                {entry.level}
              </span>
              <span className="text-gray-200 whitespace-pre-wrap break-all">
                {entry.message}
              </span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
