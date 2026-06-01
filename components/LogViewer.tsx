import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Trash2, Filter, Bug, ChevronDown } from 'lucide-react';
import * as logService from '../services/logService';
import { LogLevel, LogEntry } from '../services/logService';

interface LogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'text-slate-400',
  [LogLevel.INFO]: 'text-blue-400',
  [LogLevel.WARN]: 'text-yellow-400',
  [LogLevel.ERROR]: 'text-red-400',
};

const LEVEL_BG: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'bg-slate-700/30',
  [LogLevel.INFO]: 'bg-blue-900/20',
  [LogLevel.WARN]: 'bg-yellow-900/20',
  [LogLevel.ERROR]: 'bg-red-900/20',
};

const LEVEL_BADGE: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'bg-slate-600 text-slate-200',
  [LogLevel.INFO]: 'bg-blue-600/40 text-blue-300',
  [LogLevel.WARN]: 'bg-yellow-600/40 text-yellow-300',
  [LogLevel.ERROR]: 'bg-red-600/40 text-red-300',
};

const LogViewer: React.FC<LogViewerProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<ReadonlyArray<LogEntry>>(logService.getLogs());
  const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLogs(logService.getLogs());
    const unsub = logService.subscribe(() => {
      setLogs([...logService.getLogs()]);
    });
    return unsub;
  }, [isOpen]);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.level === filter);

  const errorCount = logs.filter(l => l.level === LogLevel.ERROR).length;
  const warnCount = logs.filter(l => l.level === LogLevel.WARN).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl animate-fade-in flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bug className="text-emerald-400" size={20} />
            Журнал событий
            {errorCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-600/30 text-red-300">
                {errorCount} ошиб.
              </span>
            )}
            {warnCount > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-600/30 text-yellow-300">
                {warnCount} пред.
              </span>
            )}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-5 py-3 border-b border-slate-700/50 flex items-center gap-3 flex-wrap">
          <Filter size={14} className="text-slate-500" />
          {(['ALL', LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG] as const).map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === level
                  ? 'bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-500/50'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {level === 'ALL' ? `Все (${logs.length})` : level}
            </button>
          ))}

          <div className="flex-1" />

          <button
            onClick={() => logService.downloadLogs('txt')}
            className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
            title="Скачать логи (.txt)"
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => {
              logService.clearLogs();
              setLogs([]);
            }}
            className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-red-900/50 hover:text-red-300 transition-all"
            title="Очистить логи"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Log Entries */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center text-slate-500 py-16">
              <Bug size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Логов пока нет</p>
              <p className="text-xs mt-1">Выполните генерацию — события появятся здесь</p>
            </div>
          ) : (
            filtered.map(entry => {
              const isExpanded = expandedIds.has(entry.id);
              const time = new Date(entry.timestamp).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={entry.id}
                  className={`rounded-lg border border-slate-700/50 ${LEVEL_BG[entry.level]} transition-all`}
                >
                  <button
                    onClick={() => entry.details && toggleExpand(entry.id)}
                    className="w-full text-left px-3 py-2 flex items-start gap-2 group"
                  >
                    {/* Time */}
                    <span className="text-[10px] text-slate-500 font-mono shrink-0 mt-0.5 min-w-[60px]">
                      {time}
                    </span>

                    {/* Level badge */}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${LEVEL_BADGE[entry.level]}`}>
                      {entry.level}
                    </span>

                    {/* Source */}
                    <span className="text-[10px] text-slate-400 font-medium shrink-0 min-w-[70px]">
                      [{entry.source}]
                    </span>

                    {/* Message */}
                    <span className={`text-xs flex-1 ${LEVEL_COLORS[entry.level]}`}>
                      {entry.message}
                    </span>

                    {/* Expand indicator */}
                    {entry.details && (
                      <ChevronDown
                        size={14}
                        className={`text-slate-500 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>

                  {/* Expanded details */}
                  {isExpanded && entry.details && (
                    <div className="px-3 pb-3 pt-0">
                      <pre className="text-[10px] text-slate-400 bg-slate-900/60 rounded-lg p-3 overflow-x-auto max-h-48 custom-scrollbar font-mono leading-relaxed">
                        {JSON.stringify(entry.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-700/50 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Макс. {500} записей • Хранение в localStorage</span>
          <span>{filtered.length} из {logs.length} записей</span>
        </div>
      </div>
    </div>
  );
};

export default LogViewer;
