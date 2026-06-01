import React, { useState, useEffect } from 'react';
import { X, Key, Save, Trash2, ShieldCheck, Zap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [orKey, setOrKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const loadedOrKey = localStorage.getItem('nano_pixel_or_key') || '';
      setOrKey(loadedOrKey);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    localStorage.setItem('nano_pixel_or_key', orKey.trim());
    // Clean up legacy Google AI Studio keys
    localStorage.removeItem('nano_pixel_user_keys');
    window.dispatchEvent(new Event('quota-updated'));
    onClose();
  };

  const handleClear = () => {
    setOrKey('');
    localStorage.removeItem('nano_pixel_or_key');
    localStorage.removeItem('nano_pixel_user_keys');
    window.dispatchEvent(new Event('quota-updated'));
  };

  if (!isOpen) return null;

  const keyActive = orKey.trim().length > 10;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 antialiased">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl animate-fade-in scale-100 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2.5">
            <Key className="text-slate-400" size={18} />
            Настройки конфигурации API
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content Area */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* OpenRouter API Key */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Zap className="text-slate-400" size={14} />
                API Ключ OpenRouter
              </label>
              <span className={`text-[10px] px-2 py-0.5 font-semibold rounded border ${keyActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                {keyActive ? '1 активный' : 'не настроен'}
              </span>
            </div>
            <input
              type="password"
              value={orKey}
              onChange={(e) => setOrKey(e.target.value)}
              placeholder="sk-or-v1-... (Ваш ключ OpenRouter)"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 font-mono text-xs focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none placeholder-slate-600 transition-all"
            />

            {/* Key Info Card */}
            <div className="bg-slate-950/40 rounded-xl p-3.5 border border-slate-800 space-y-2.5">
              <span className="text-xs font-semibold text-slate-400 block">Единый ключ для всех моделей:</span>

              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 flex flex-col space-y-1.5">
                <span className="text-xs font-semibold text-slate-300">OpenRouter API</span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Универсальный доступ ко всем моделям: Gemini, FLUX.2 и другие. Один ключ — все нейросети. Ключи начинаются на <code className="text-slate-400 font-mono bg-slate-900 px-1 py-0.5 rounded text-[10px]">sk-or-v1-</code>.
                </p>
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold hover:underline inline-flex items-center gap-1 pt-0.5"
                >
                  Получить API ключ →
                </a>
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed pt-1.5 border-t border-slate-800/60">
                💡 OpenRouter — единый шлюз к лучшим нейросетям мира. Оплата по факту использования, без подписок.
              </p>
            </div>
          </div>

          {/* Secure footnote */}
          <div className="flex items-center gap-2 justify-center py-1 text-[10px] text-slate-400 text-center">
            <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
            <span>Все API-ключи хранятся локально в вашем браузере (<code className="text-slate-400 font-mono bg-slate-950/40 px-1 py-0.5 rounded text-[10px]">localStorage</code>) и не передаются в облако.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-800 flex gap-4">
          <button
            onClick={handleClear}
            className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={14} />
            Очистить
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs font-bold shadow-lg shadow-emerald-950/20 hover:shadow-emerald-900/30 transition-all flex items-center justify-center gap-2"
          >
            <Save size={14} />
            Сохранить и Применить
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;