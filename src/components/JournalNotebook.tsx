import React, { useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";

interface JournalNotebookProps {
  onSaveJournal: (text: string) => Promise<void>;
  isAnalyzing: boolean;
}

export default function JournalNotebook({ onSaveJournal, isAnalyzing }: JournalNotebookProps) {
  const [journalText, setJournalText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;
    await onSaveJournal(journalText);
    setJournalText("");
  };

  return (
    <div id="journal-notebook-card" className="max-w-2xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-100">Self-Reflection Notebook</h2>
          <p className="text-xs text-slate-400">Unlock your stream of worries to let Gemini analyze your stress curves</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs text-slate-400 leading-normal pl-1 mb-2 font-sans">
            Feel free to dump all high-pressure thoughts about comparative test worries, mocks scores, syllabus backlogs, families expectations, or peer comparison. Your logs are kept locally and processed via high-grade secure server prompts.
          </p>
          
          <textarea
            id="journal-textarea"
            rows={8}
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Rohan's optics preparation progress is making me freeze... when I sit for Chemistry mocks, my mind goes absolutely blank..."
            className="w-full bg-slate-100 text-slate-900 border border-slate-350 rounded-xl p-4 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-slate-500 font-sans shadow-inner selection:bg-indigo-200"
          />
        </div>

        <button
          id="analyse-journal-button"
          type="submit"
          disabled={isAnalyzing || !journalText.trim()}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 hover:border-emerald-400 rounded-xl font-medium text-xs shadow-lg shadow-emerald-950/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
          <span>Analyze notebook pages with Gemini</span>
        </button>
      </form>
    </div>
  );
}
