import React, { useState } from "react";
import { Smile, Plus } from "lucide-react";

export const SYSTEM_CONTEXT_TAGS = [
  "Mock Exam Preparation",
  "Syllabus Backlog Revision",
  "Slept Under 5 Hours",
  "Peer Practice Discussion",
  "Parental Expectation Conversation",
  "Mindful Movement Break",
  "Late-Night Library Block",
];

interface MoodLoggerProps {
  onSaveMood: (moodScore: number, stressScore: number, tags: string[], note: string) => Promise<void>;
  isSaving: boolean;
}

export default function MoodLogger({ onSaveMood, isSaving }: MoodLoggerProps) {
  const [moodValue, setMoodValue] = useState(6);
  const [stressValue, setStressValue] = useState(5);
  const [moodNote, setMoodNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveMood(moodValue, stressValue, selectedTags, moodNote);
    // Reset fields on success
    setMoodValue(6);
    setStressValue(5);
    setMoodNote("");
    setSelectedTags([]);
  };

  return (
    <div id="mood-logger-card" className="max-w-2xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg" aria-hidden="true">
          <Smile className="w-5 h-5" />
        </div>
        <div>
          <h2 id="mood-logger-title" className="text-xl font-bold font-sans tracking-tight text-slate-100">Log Mind Balance Metrics</h2>
          <p className="text-xs text-slate-400">Map your study fatigue and relative focus coordinates</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood Index Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="mood-score-slider" className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">
              Aspirant Mood Score (1 to 10)
            </label>
            <span
              className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 font-mono font-bold text-xs rounded"
              aria-live="polite"
            >
              {moodValue === 10 ? "🧘 Fully Centered (10)" : moodValue >= 7 ? "😊 Mind Balanced" : moodValue >= 4 ? "😐 Normal Tension" : "😭 Brain Frozen / Panic"}
            </span>
          </div>
          <input
            id="mood-score-slider"
            type="range"
            min="1"
            max="10"
            value={moodValue}
            onChange={(e) => setMoodValue(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-valuemin={1}
            aria-valuemax={10}
            aria-valuenow={moodValue}
          />
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono" aria-hidden="true">
            <span>1 - Despair / Panic</span>
            <span>5 - Moderate</span>
            <span>10 - Zen Flow</span>
          </div>
        </div>

        {/* Stress Index Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="stress-score-slider" className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">
              Active Stress Score (1 to 10)
            </label>
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                stressValue >= 8
                  ? "bg-rose-500/15 border border-rose-500/25 text-rose-300 fill-rose-500 animate-pulse"
                  : stressValue >= 5
                  ? "bg-amber-500/15 border border-amber-500/25 text-amber-300"
                  : "bg-emerald-500/10 border border-emerald-500/25 text-emerald-300"
              }`}
              aria-live="polite"
            >
              Score: {stressValue}/10
            </span>
          </div>
          <input
            id="stress-score-slider"
            type="range"
            min="1"
            max="10"
            value={stressValue}
            onChange={(e) => setStressValue(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            aria-valuemin={1}
            aria-valuemax={10}
            aria-valuenow={stressValue}
          />
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono" aria-hidden="true">
            <span>1 - Sleeping Soundly</span>
            <span>5 - Tension Pacing</span>
            <span>10 - Complete Burnout / Freeze</span>
          </div>
        </div>

        {/* Checklist context tags select */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono block">
            Preparation context triggers (Select all relevant)
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Preparation context trigger tags">
            {SYSTEM_CONTEXT_TAGS.map((tag) => {
              const selected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  aria-pressed={selected}
                  className={`px-3 py-1.5 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    selected
                      ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/50 shadow-sm"
                      : "bg-slate-800 text-slate-400 border-slate-800 hover:bg-slate-800/80 hover:text-slate-200"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Focus optional micro notes details */}
        <div className="space-y-2">
          <label htmlFor="mood-note-input" className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono block">
            Optional study notes
          </label>
          <input
            id="mood-note-input"
            type="text"
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
            placeholder="E.g. Math practice took twice as long, finished kinetics revision backlog."
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500 mt-1 placeholder-slate-600 font-sans"
          />
        </div>

        {/* Commit Action */}
        <button
          id="commit-mood-button"
          type="submit"
          disabled={isSaving}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 hover:border-indigo-400 rounded-xl font-medium text-xs shadow-lg shadow-indigo-950/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={isSaving ? "Registering mind node..." : "Commit daily registry"}
        >
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
              <span>Registering Mind Node...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 text-white" aria-hidden="true" />
              <span>Commit Daily Registry</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
