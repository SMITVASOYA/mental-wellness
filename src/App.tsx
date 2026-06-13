import { useState, useEffect } from "react";
import { UserProfile, MoodEntry, JournalEntry, ChatMessage } from "./types";
import { apiService } from "./services/api.service";
import Dashboard from "./components/Dashboard";
import TrendsChart from "./components/TrendsChart";
import BreathingWidget from "./components/BreathingWidget";
import CrisisModal from "./components/CrisisModal";
import MoodLogger from "./components/MoodLogger";
import JournalNotebook from "./components/JournalNotebook";
import CompanionChat from "./components/CompanionChat";
import { motion, AnimatePresence } from "motion/react";

import {
  ShieldAlert,
  Moon,
  Sparkles,
  Compass,
} from "lucide-react";

export default function App() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "Aspirant",
    targetExam: "JEE",
    studyHoursGoal: 8,
  });

  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);

  // Navigation states
  const [activeTab, setActiveTab] = useState<"dashboard" | "mood" | "journal" | "chat" | "breathing">("dashboard");
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);

  // Loading indicator states
  const [isLogSaving, setIsLogSaving] = useState(false);
  const [isAnalyzingJournal, setIsAnalyzingJournal] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load initial dataset on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [profData, moodData, journalData, chatData] = await Promise.all([
        apiService.getProfile().catch(() => null),
        apiService.getMoods().catch(() => null),
        apiService.getJournals().catch(() => null),
        apiService.getChats().catch(() => null),
      ]);

      if (profData) setProfile(profData);
      if (moodData) setMoods(moodData);
      if (journalData) setJournals(journalData);
      if (chatData) setChats(chatData);
    } catch (err) {
      console.warn("Express backend connection load. Operating in safe client mode.", err);
      setErrorMessage("Operating in safe offline mode due to API response loading.");
    }
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    try {
      const data = await apiService.updateProfile(updated);
      setProfile(data);
    } catch (err: any) {
      console.error(err);
      setProfile((prev) => ({ ...prev, ...updated }));
      setErrorMessage(err.message || "Failed to update profile coordinates.");
    }
  };

  const handleSaveMood = async (moodScore: number, stressScore: number, contextTags: string[], optionalNote: string) => {
    setIsLogSaving(true);
    setErrorMessage("");

    try {
      const saved = await apiService.logMood({
        moodScore,
        stressScore,
        contextTags,
        optionalNote,
      });
      setMoods((prev) => [saved, ...prev]);
      setActiveTab("dashboard");
    } catch (err: any) {
      console.error(err);
      // Fallback local append for disconnected environments
      const mockSaved: MoodEntry = {
        id: "mood-local-" + Date.now(),
        timestamp: new Date().toISOString(),
        moodScore,
        stressScore,
        contextTags,
        optionalNote,
      };
      setMoods((prev) => [mockSaved, ...prev]);
      setActiveTab("dashboard");
    } finally {
      setIsLogSaving(false);
    }
  };

  const handleDeleteMood = async (id: string) => {
    try {
      await apiService.deleteMood(id);
      setMoods((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      setMoods((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleJournalSubmit = async (entryText: string) => {
    setIsAnalyzingJournal(true);
    setErrorMessage("");

    try {
      const analyzedEntry = await apiService.logJournal(entryText);
      setJournals((prev) => [analyzedEntry, ...prev]);
      setActiveTab("dashboard");
    } catch (err: any) {
      console.error(err);
      // Fallback local append with structured mock diagnostics
      const fallbackEntry: JournalEntry = {
        id: "journal-local-" + Date.now(),
        timestamp: new Date().toISOString(),
        entryText,
        analysisStatus: "completed",
        analysis: {
          sentiment: "Overburdened (Local Mode)",
          stressLevel: "High",
          primaryTrigger: "Syllabus Backlog Expansion",
          triggerDescription: "Local diagnostic simulation triggered offline.",
          empatheticSummary: "Sarthi context service is busy but offline diagnostic suggests micro-chunking study topics.",
          copingStrategies: [
            "De-screen now: Eliminate electronic monitors 45 minutes prior to sleeping.",
            "Utilize classic 4-7-8 deep breathing loop to steady heart rate.",
            "Record a micro focus success token to reset comparison pressures."
          ],
          isSafetyFlagged: false,
        }
      };
      setJournals((prev) => [fallbackEntry, ...prev]);
      setActiveTab("dashboard");
    } finally {
      setIsAnalyzingJournal(false);
    }
  };

  const handleSendChat = async (inputMsg: string) => {
    if (!inputMsg.trim() || isSendingChat) return;

    setIsSendingChat(true);
    setErrorMessage("");

    // Push instant optimistic local student bubble
    const userBubble: ChatMessage = {
      id: "msg-user-temp-" + Date.now(),
      timestamp: new Date().toISOString(),
      sender: "student",
      text: inputMsg,
    };
    setChats((prev) => [...prev, userBubble]);

    try {
      const parsed = await apiService.sendChat(inputMsg);
      setChats(parsed.history);
    } catch (err: any) {
      console.error(err);
      // Fallback response values
      const fallbackReply: ChatMessage = {
        id: "msg-comp-temp-" + Date.now(),
        timestamp: new Date().toISOString(),
        sender: "companion",
        text: `I'm with you, ${profile.name}. Preparing for ${profile.targetExam} is an athletic cognitive marathon. Mocks are diagnostic nodes rather than binding scores. Settle into box breathing, and let's tackle the next block together.`,
      };
      setChats((prev) => [...prev, fallbackReply]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleClearChats = async () => {
    try {
      await apiService.clearChats();
      setChats([]);
    } catch (err) {
      console.error(err);
      setChats([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-150 relative">
      
      {/* Dynamic processing backdrop load during Gemini Analysis */}
      {isAnalyzingJournal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 space-y-4 select-none">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <Sparkles className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="text-center space-y-1.5 max-w-sm">
            <h4 className="text-base font-bold text-slate-100 font-sans tracking-tight">Unpacking emotional nodes...</h4>
            <p className="text-xs text-slate-400 leading-normal animate-pulse">
              Gemini is parsing stress roots, isolating key triggers, and preparing customized coping exercises safely...
            </p>
          </div>
        </div>
      )}

      {/* Top Banner Navigation bar */}
      <header className="sticky top-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-950/20">
            <Compass className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-sans tracking-tight text-slate-50 flex items-center space-x-1.5">
              <span>Sarthi</span>
              <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-md font-mono select-none uppercase font-bold tracking-widest animate-pulse">v3.5</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">Exam Stress Counter & Mind Balancer</p>
          </div>
        </div>

        {/* Action Controls Tabs (Horizontal) */}
        <nav className="hidden md:flex items-center space-x-1.5">
          {[
            { id: "dashboard", label: "Cockpit" },
            { id: "mood", label: "Log Mind Balance" },
            { id: "journal", label: "Notebook" },
            { id: "chat", label: "Companion Chat" },
            { id: "breathing", label: "Physiological Reset" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium font-sans tracking-tight transition cursor-pointer relative ${
                activeTab === tab.id
                  ? "bg-slate-800 text-slate-100 border border-slate-700/60 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-500 rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Global Urgent Emergency Helpline Redirection Trigger */}
        <button
          onClick={() => setIsCrisisOpen(true)}
          className="px-4 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs flex items-center space-x-1.5 font-bold transition hover:border-rose-400 cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden sm:inline">Emergency Helplines</span>
        </button>
      </header>

      {/* Primary body container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Mobile Navigation tab links */}
        <div className="flex md:hidden items-center justify-between bg-slate-900 border border-slate-800/85 p-1.5 rounded-xl overflow-x-auto text-xs font-sans select-none scrollbar-hide">
          {[
            { id: "dashboard", label: "Cockpit" },
            { id: "mood", label: "Log" },
            { id: "journal", label: "Notebook" },
            { id: "chat", label: "Companion" },
            { id: "breathing", label: "Reset" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap tracking-tight transition-all cursor-pointer ${
                activeTab === tab.id ? "bg-slate-800 text-slate-100 font-bold" : "text-slate-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Page Tab Renderings with graceful motion layout transitions */}
        <div id="tab-content-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Trends line chart viz */}
                  <TrendsChart moods={moods} />
                  
                  {/* Profile statistics cockpit feed */}
                  <Dashboard
                    profile={profile}
                    moods={moods}
                    journals={journals}
                    onUpdateProfile={handleUpdateProfile}
                    onDeleteMood={handleDeleteMood}
                    onTriggerCrisis={() => setIsCrisisOpen(true)}
                  />
                </div>
              )}

              {activeTab === "mood" && (
                <MoodLogger onSaveMood={handleSaveMood} isSaving={isLogSaving} />
              )}

              {activeTab === "journal" && (
                <JournalNotebook onSaveJournal={handleJournalSubmit} isAnalyzing={isAnalyzingJournal} />
              )}

              {activeTab === "chat" && (
                <CompanionChat
                  chats={chats}
                  onSendChat={handleSendChat}
                  onClearChats={handleClearChats}
                  isSending={isSendingChat}
                  profileName={profile.name}
                  profileExam={profile.targetExam}
                />
              )}

              {activeTab === "breathing" && <BreathingWidget />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating alert errors toast bar */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 p-4 bg-rose-600 border border-rose-500 text-white rounded-xl shadow-2xl text-xs flex items-center space-x-2 z-50 animate-fade-in max-w-sm font-sans font-medium">
          <ShieldAlert className="w-4 h-4 shrink-0 animate-pulse" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage("")} className="hover:opacity-75 pl-2 text-rose-200 font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Actual Counseling numbers overlays modal */}
      <CrisisModal isOpen={isCrisisOpen} onClose={() => setIsCrisisOpen(false)} />

      {/* Footer copyright */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-[11px] text-slate-400 leading-normal font-sans shadow-inner mt-12">
        <p>© 2026-2027 Sarthi Student Wellness Alliance • Grounded in Gemini AI</p>
        <p className="text-slate-500 text-[10px] mt-1 italic font-mono">
          Disclaimer: Sarthi is an empathetic peer guide to count and reframe exam stressors. It is not a licensed replacement for human clinical therapy.
        </p>
      </footer>

    </div>
  );
}
