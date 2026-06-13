import { useState } from "react";
import { UserProfile, MoodEntry, JournalEntry } from "../types";
import {
  Calendar,
  Settings2,
  CheckCircle2,
  Trash2,
  BookOpen,
  Frown,
  BrainCircuit,
  Award,
  ChevronRight,
  Heart,
  Smile,
  ShieldAlert,
} from "lucide-react";

interface DashboardProps {
  profile: UserProfile;
  moods: MoodEntry[];
  journals: JournalEntry[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onDeleteMood: (id: string) => void;
  onTriggerCrisis: () => void;
}

export default function Dashboard({
  profile,
  moods,
  journals,
  onUpdateProfile,
  onDeleteMood,
  onTriggerCrisis,
}: DashboardProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editExam, setEditExam] = useState(profile.targetExam);
  const [editGoal, setEditGoal] = useState(profile.studyHoursGoal);

  const [toggledCopingItems, setToggledCopingItems] = useState<{ [key: string]: boolean }>({});

  const toggleCoping = (journalId: string, idx: number) => {
    const key = `${journalId}-${idx}`;
    setToggledCopingItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveProfile = () => {
    onUpdateProfile({
      name: editName || "Student",
      targetExam: editExam,
      studyHoursGoal: Number(editGoal) || 8,
    });
    setIsEditingProfile(false);
  };

  // Find latest compiled analysis
  const latestJournal = journals.find((j) => j.analysisStatus === "completed" && j.analysis);
  const latestAnalysis = latestJournal?.analysis;

  // Emotional summary computations
  const totalEntries = moods.length;
  const highStressCount = moods.filter((m) => m.stressScore >= 7).length;
  const averageMood = totalEntries > 0 ? (moods.reduce((sum, m) => sum + m.moodScore, 0) / totalEntries).toFixed(1) : "N/A";

  // Emoji and advice generator based on average mood
  const getDashboardStatus = () => {
    const moodNum = Number(averageMood);
    if (isNaN(moodNum)) return { emoji: "📖", style: "text-slate-400", cardBg: "bg-slate-950/20", motivation: "Welcome to Sarthi. Log your daily mood to activate stress triggers detection." };
    if (moodNum <= 4) {
      return {
        emoji: "🤯",
        style: "text-rose-400",
        cardBg: "bg-rose-500/5 border-rose-500/20 animate-pulse",
        motivation: "System warns of severe cognitive load. Please use the Somatic Reset breathing station and consider calling a tutor.",
      };
    }
    if (moodNum <= 7) {
      return {
        emoji: "🥺",
        style: "text-amber-400",
        cardBg: "bg-amber-500/5 border-amber-500/20",
        motivation: "Hectic study pacing detected. Keep studying blockages isolated and write out chapters in daily chunks.",
      };
    }
    return {
      emoji: "🧘",
      style: "text-emerald-400",
      cardBg: "bg-emerald-500/5 border-emerald-500/20",
      motivation: "Mind balanced. Focus is continuous. Remember to keep study intervals capped at 90 minutes to protect focus.",
    };
  };

  const status = getDashboardStatus();

  return (
    <div id="student-cockpit-layout" className="space-y-6">
      {/* 1. Header welcome banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{status.emoji}</span>
            <h2 className="text-2xl font-bold font-sans tracking-tight text-slate-100">
              Welcome back, {profile.name}
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Focus Cockpit calibrated for <b className="text-indigo-400">{profile.targetExam}</b>. Remember: mocks diagnose preparation focus, they never declare your lifetime worth.
          </p>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono mt-1 select-none">
            <Calendar className="w-3.5 h-3.5" />
            <span>Preparation Track Term: 2026/2027</span>
            <span>•</span>
            <span>Micro focus target: {profile.studyHoursGoal} hrs/day</span>
          </div>
        </div>

        {/* Profile Settings Quick Button */}
        <div className="mt-4 md:mt-0 shrink-0">
          {isEditingProfile ? (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 w-64 text-left">
              <h4 className="text-xs font-bold text-indigo-400 uppercase">Aspirant Settings</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-mono">My Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-mono">Target Exam</label>
                  <select
                    value={editExam}
                    onChange={(e) => setEditExam(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 mt-1 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="JEE">JEE Mains & Advanced</option>
                    <option value="NEET">NEET UG (Medical)</option>
                    <option value="UPSC">UPSC Civil Services</option>
                    <option value="CAT">CAT (Management)</option>
                    <option value="GATE">GATE (Engineering)</option>
                    <option value="Board Exams">Senior Secondary Boards</option>
                    <option value="Other">Standard Competitive Test</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-mono">Focus Limit (Hours/day)</label>
                  <input
                    type="number"
                    value={editGoal}
                    onChange={(e) => setEditGoal(Number(e.target.value))}
                    min={1}
                    max={18}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 mt-1 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between space-x-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="bg-indigo-600 hover:bg-indigo-500 hover:border-indigo-500 px-3 py-1 rounded text-[10px] text-white font-medium"
                >
                  Apply Settings
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-slate-100 transition text-xs flex items-center space-x-2 cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Modify Target Goal</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Key metrics and recommendations banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric A: Over stress state */}
        <div className={`p-4 rounded-2xl border ${status.cardBg} flex flex-col justify-between h-36 relative overflow-hidden shadow-md`}>
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500">Aspirant Focus Load</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className={`text-4xl font-extrabold ${status.style}`}>{averageMood}</span>
              <span className="text-xs text-slate-500">/ 10</span>
            </div>
          </div>
          <span className="text-[11px] leading-snug text-slate-300 pr-4 mt-2">
            Average mental clarity score calculated across daily shifts.
          </span>
        </div>

        {/* Metric B: High Stress triggers detected */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 flex flex-col justify-between h-36 shadow-md">
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500">Severe Burnout Intervals</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-4xl font-extrabold text-rose-400">{highStressCount}</span>
              <span className="text-xs text-slate-500">days recorded</span>
            </div>
          </div>
          <span className="text-[11px] leading-snug text-slate-300">
            {highStressCount > 0 ? "High stress blocks logged. Take a breathing break soon." : "Well done! Your mental stress tags are under buffer limits."}
          </span>
        </div>

        {/* Metric C: Active Primary stress root trigger from latest Gemini Analysis */}
        <div className="col-span-1 md:col-span-2 p-4 rounded-2xl border border-slate-800 bg-slate-900 flex flex-col justify-between h-36 relative overflow-hidden shadow-md">
          {latestAnalysis ? (
            <>
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-indigo-400 flex items-center space-x-1.5 font-bold">
                  <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Isolated Active Stress Trigger</span>
                </span>
                <h4 className="text-sm font-bold text-slate-100 mt-1 tracking-tight truncate">
                  {latestAnalysis.primaryTrigger}
                </h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-normal line-clamp-2 pr-2">
                {latestAnalysis.triggerDescription}
              </p>
            </>
          ) : (
            <>
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500">Self-Reflection Core</span>
                <h4 className="text-sm font-bold text-slate-400 mt-1 tracking-tight">Triggers Heatmap (Inactive)</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Go to the <span className="text-indigo-400">Journal tab</span> and write about your test mock scores or study hurdles to let Gemini diagnose your exact stress triggers.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Safety / Crisis Immediate Alert Bar */}
      {latestAnalysis?.isSafetyFlagged && (
        <div className="p-4 bg-rose-500/10 border border-rose-500 rounded-2xl flex items-start space-x-4">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1.5 flex-1">
            <h4 className="text-xs font-bold text-rose-400 uppercase">Emergency Support Activation</h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              We detected expressions of intense pain, hopelessness, or life weariness in your recent journal. Your life is infinitely larger and more invaluable than UPSC rank, NEET percentile, or class mocks.
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <button
                onClick={onTriggerCrisis}
                className="bg-rose-600 hover:bg-rose-500 border border-rose-500 hover:border-rose-400 text-xs px-3.5 py-1.5 rounded-lg text-white font-medium shadow-md shadow-rose-950/20 transition cursor-pointer"
              >
                Unlock Local Helpline Contact Numbers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Deep emotional history feed list (Aspirant Diary Feed) */}
      <div id="aspirant-diary-feed" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <h3 className="text-base font-semibold text-slate-200">Historical Emotional Feeds</h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Sorted by Newest entries first</span>
        </div>

        {journals.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
            <Frown className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-sans text-slate-400">Your student journal log is completely empty.</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Open your notebook in the <span className="text-indigo-400 hover:underline">Self Reflection Tab</span> to write down what's worrying you and let your companion "Sarthi" help organize your thoughts.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {journals.map((journal) => (
              <div
                key={journal.id}
                className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-800/80 rounded-2xl shadow-sm transition space-y-4 text-left"
              >
                {/* Meta details header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(journal.timestamp).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>•</span>
                    {journal.analysis?.sentiment ? (
                      <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/25 rounded-md text-[10px] font-medium text-indigo-300">
                        {journal.analysis.sentiment}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-[10px] font-mono text-slate-400">
                        Analyzing...
                      </span>
                    )}
                  </div>

                  {/* Stress Level Chip indicator */}
                  {journal.analysis?.stressLevel && (
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider font-mono px-2 py-0.5 rounded ${
                        journal.analysis.stressLevel === "Critical"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                          : journal.analysis.stressLevel === "High"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-400/20"
                          : journal.analysis.stressLevel === "Medium"
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/20"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {journal.analysis.stressLevel} stress
                    </span>
                  )}
                </div>

                {/* Main Client Journal Text reflection */}
                <div className="text-xs text-slate-300 leading-relaxed border-l-2 border-slate-800 pl-3 italic select-text">
                  "{journal.entryText}"
                </div>

                {/* Gemini Analysis Outcomes */}
                {journal.analysisStatus === "pending" && (
                  <div className="p-3 bg-slate-950/40 rounded-xl flex items-center space-x-3 text-xs text-slate-400 font-sans">
                    <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Gemini is analyzing emotional markers and framing custom coping strategies...</span>
                  </div>
                )}

                {journal.analysisStatus === "failed" && (
                  <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-xs text-rose-400">
                    Failed to run live GenAI trigger mapping. Your journal text is saved locally.
                  </div>
                )}

                {journal.analysisStatus === "completed" && journal.analysis && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-1">
                    {/* Empathetic Summary */}
                    <div className="col-span-1 md:col-span-3 p-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5 font-sans">
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        <span>Sarthi validation check</span>
                      </h5>
                      <p className="text-xs text-slate-300 leading-normal font-sans">
                        {journal.analysis.empatheticSummary}
                      </p>
                    </div>

                    {/* Coping Checklist */}
                    <div className="col-span-1 md:col-span-2 p-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2">
                      <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center space-x-1.5 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Personal Coping list</span>
                      </h5>
                      <div className="space-y-1.5 text-[11px] leading-snug">
                        {journal.analysis.copingStrategies.map((strategy, idx) => {
                          const itemKey = `${journal.id}-${idx}`;
                          const isCompleted = !!toggledCopingItems[itemKey];

                          return (
                            <button
                              key={idx}
                              onClick={() => toggleCoping(journal.id, idx)}
                              className={`w-full text-left flex items-start space-x-2 p-1.5 rounded hover:bg-slate-900/60 transition ${
                                isCompleted ? "opacity-50 line-through text-slate-500" : "text-slate-300"
                              }`}
                            >
                              <span
                                className={`w-3.5 h-3.5 rounded border mt-0.5 shrink-0 flex items-center justify-center font-bold text-[9px] ${
                                  isCompleted ? "bg-emerald-500/20 text-emerald-400 border-emerald-500" : "border-slate-700"
                                }`}
                              >
                                {isCompleted ? "✓" : ""}
                              </span>
                              <span>{strategy}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Active Mood Logs Table */}
      <div id="mood-logs-table-section" className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-semibold text-slate-200">Daily Mind Balance Registers</h3>
          </div>
          <span className="text-xs text-slate-400">Cleared once study balance stabilizes</span>
        </div>

        {moods.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No daily logs registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Mind Score</th>
                  <th className="py-2.5">Stress Score</th>
                  <th className="py-2.5">Context Tags</th>
                  <th className="py-2.5">Daily Study Note</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {moods.map((mood) => (
                  <tr key={mood.id} className="hover:bg-slate-950/20 transition">
                    <td className="py-2.5 whitespace-nowrap font-mono text-[10px] text-slate-400">
                      {new Date(mood.timestamp).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md font-bold">
                        {mood.moodScore}/10
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold ${mood.stressScore >= 7 ? "bg-rose-500/10 text-rose-400" : "bg-indigo-500/10 text-indigo-400"}`}>
                        {mood.stressScore}/10
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {mood.contextTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded border border-slate-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-300 font-sans max-w-xs truncate" title={mood.optionalNote}>
                      {mood.optionalNote || <span className="text-slate-600">-</span>}
                    </td>
                    <td className="py-2.5 text-right font-sans">
                      <button
                        onClick={() => onDeleteMood(mood.id)}
                        className="p-1 hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 rounded transition cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
