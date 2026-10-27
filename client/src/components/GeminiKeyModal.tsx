import React, { useState } from 'react';
import { X, Sparkles, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { getCustomGeminiKey, setCustomGeminiKey } from '../services/api.js';

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export const GeminiKeyModal: React.FC<GeminiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved
}) => {
  const [key, setKey] = useState<string>(getCustomGeminiKey());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setCustomGeminiKey(key.trim());
    setSaved(true);
    onKeySaved(key.trim());
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setKey('');
    setCustomGeminiKey('');
    onKeySaved('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Gemini AI Configuration</h3>
            <p className="text-xs text-slate-400">Model: <code className="text-purple-300">gemini-2.5-flash</code></p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Provide your Google Gemini API key to enable live AI-driven dynamic pricing, competitor elasticity analysis, and executive strategy rationale generation via the official <code className="text-indigo-400">@google/genai</code> SDK.
        </p>

        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Gemini API Key
          </label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
          />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 mb-5">
          <div className="flex items-start space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-400 leading-normal">
              <strong>Offline Resiliency:</strong> If left empty, RetailPulse AI automatically engages our built-in quantitative retail pricing model with demand elasticity formulas. No API downtime!
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300"
          >
            <span>Get free key</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <div className="flex space-x-2">
            {key && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Key</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
