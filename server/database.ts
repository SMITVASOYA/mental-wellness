import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "wellness_db.json");

export interface UserProfile {
  name: string;
  targetExam: string;
  studyHoursGoal: number;
}

export interface MoodEntry {
  id: string;
  timestamp: string;
  moodScore: number;     // 1-10
  stressScore: number;   // 1-10
  contextTags: string[]; // e.g. ["Mock Test", "Self Study", "Classroom", "Family Time", "Peer Chat"]
  optionalNote: string;
}

export interface JournalAnalysis {
  sentiment: string;
  stressLevel: "Low" | "Medium" | "High" | "Critical";
  primaryTrigger: string;
  triggerDescription: string;
  empatheticSummary: string;
  copingStrategies: string[];
  isSafetyFlagged: boolean;
}

export interface JournalEntry {
  id: string;
  timestamp: string;
  entryText: string;
  associatedMoodId?: string;
  analysisStatus: "pending" | "completed" | "failed";
  analysis?: JournalAnalysis;
}

export interface ChatMessage {
  id: string;
  timestamp: string;
  sender: "student" | "companion";
  text: string;
}

interface DBStructure {
  profile: UserProfile;
  moods: MoodEntry[];
  journals: JournalEntry[];
  chats: ChatMessage[];
}

const DEFAULT_DB: DBStructure = {
  profile: {
    name: "Aspirant",
    targetExam: "JEE",
    studyHoursGoal: 8,
  },
  moods: [
    {
      id: "mood-1",
      timestamp: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
      moodScore: 6,
      stressScore: 7,
      contextTags: ["Mock Test", "Self Study"],
      optionalNote: "Gave the Math practice paper today. Tricky integration section, got stuck and panicked a bit.",
    },
    {
      id: "mood-2",
      timestamp: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
      moodScore: 4,
      stressScore: 8,
      contextTags: ["Peer Chat"],
      optionalNote: "Talked to Rohan. He's already finished the physics backlog. Feeling a lot of pressure.",
    },
    {
      id: "mood-3",
      timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
      moodScore: 7,
      stressScore: 5,
      contextTags: ["Self Study", "Family Time"],
      optionalNote: "Had tea with parents, talked it out. Better revision session in inorganic chemistry.",
    },
    {
      id: "mood-4",
      timestamp: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
      moodScore: 8,
      stressScore: 3,
      contextTags: ["Meditation", "Self Study"],
      optionalNote: "Tried breathing exercise before studying. Sleep was decent. Mechanics numericals solved smoothly.",
    }
  ],
  journals: [
    {
      id: "j-1",
      timestamp: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
      entryText: "Rohan's progress is stressing me out so much. I still have optics chapters left to revise, and when I realize I am lagging behind my confidence plunges. Every mock test feels like it will decide my whole life and future. Parents are supportive but I feel their eyes on me constantly.",
      analysisStatus: "completed",
      analysis: {
        sentiment: "Overwhelmed & Self-Doubtful",
        stressLevel: "High",
        primaryTrigger: "Peer Comparison & Future Anxiety",
        triggerDescription: "Comparing study progress with friends (Rohan) coupled with high stakes attached to mock tests leads to severe future anxiety and pacing stress.",
        empatheticSummary: "You are experiencing classic preparation burnout driven by comparing your timeline to someone else's. This triggers a fight-or-flight freeze in optics study.",
        copingStrategies: [
          "Study Boundary rules: Do not discuss complete syllabus status with friends till next weekend.",
          "Optics Breakout: Set a micro-goal of solving just 5 lens formula numericals without timing yourself.",
          "Use the 4-7-8 Breathing Loop inside the breathing tab to step back when the physical symptoms of comparison hit."
        ],
        isSafetyFlagged: false
      }
    },
    {
      id: "j-2",
      timestamp: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
      entryText: "Did an early session today. Felt way more organized. Kept my phone locked in the other room. inorganic revision is boring but manageable in 30 minute chunks. Breathing exercises are helping me reset my pulse rate between chemistry shifts.",
      analysisStatus: "completed",
      analysis: {
        sentiment: "Focused & Grounded",
        stressLevel: "Low",
        primaryTrigger: "Effective Environment Control & Mindfulness",
        triggerDescription: "Removing the smartphone distraction and practicing chunked time blocking directly improved focus and overall prepare confidence.",
        empatheticSummary: "Fantastic initiative in scheduling study intervals and reducing reactive phone checking. Building focus momentum step by step.",
        copingStrategies: [
          "Continue 'Phone in the outer room' policy during morning shifts.",
          "Add a 5-minute movement break between study sprints.",
          "Log your focus success in tomorrow's mood note."
        ],
        isSafetyFlagged: false
      }
    }
  ],
  chats: [
    {
      id: "c-1",
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
      sender: "student",
      text: "How do I deal with scoring low in my chemistry mocks? I fell down 20 marks inside organic chemistry."
    },
    {
      id: "c-2",
      timestamp: new Date(Date.now() - 11.9 * 3600000).toISOString(),
      sender: "companion",
      text: "I completely understand how disappointing that drop feels. But remember: Mock exams are not a final destination, they are diagnostic heatmaps. Organic chemistry requires pattern recognition rather than brute memorization. Let's isolate the specific reaction mechanism that caught you off guard today."
    }
  ]
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readDB(): DBStructure {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
    return DEFAULT_DB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read database, falling back to default:", err);
    return DEFAULT_DB;
  }
}

export function writeDB(db: DBStructure) {
  ensureDir();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to database file:", err);
  }
}

// Service APIs
export function getProfile(): UserProfile {
  return readDB().profile;
}

export function updateProfile(profile: Partial<UserProfile>): UserProfile {
  const db = readDB();
  db.profile = { ...db.profile, ...profile };
  writeDB(db);
  return db.profile;
}

export function getMoods(): MoodEntry[] {
  const db = readDB();
  // Sort by newest first
  return [...db.moods].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function logMood(entry: Omit<MoodEntry, "id" | "timestamp">): MoodEntry {
  const db = readDB();
  const newEntry: MoodEntry = {
    ...entry,
    id: "mood-" + Date.now(),
    timestamp: new Date().toISOString(),
  };
  db.moods.push(newEntry);
  writeDB(db);
  return newEntry;
}

export function deleteMood(id: string): boolean {
  const db = readDB();
  const initialLength = db.moods.length;
  db.moods = db.moods.filter((m) => m.id !== id);
  if (db.moods.length < initialLength) {
    writeDB(db);
    return true;
  }
  return false;
}

export function getJournals(): JournalEntry[] {
  const db = readDB();
  return [...db.journals].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addJournal(entryText: string, associatedMoodId?: string): JournalEntry {
  const db = readDB();
  const newEntry: JournalEntry = {
    id: "journal-" + Date.now(),
    timestamp: new Date().toISOString(),
    entryText,
    associatedMoodId,
    analysisStatus: "pending"
  };
  db.journals.push(newEntry);
  writeDB(db);
  return newEntry;
}

export function updateJournalAnalysis(id: string, update: { analysisStatus: "completed" | "failed"; analysis?: JournalAnalysis }): JournalEntry | null {
  const db = readDB();
  const idx = db.journals.findIndex((j) => j.id === id);
  if (idx !== -1) {
    db.journals[idx] = {
      ...db.journals[idx],
      ...update
    };
    writeDB(db);
    return db.journals[idx];
  }
  return null;
}

export function getChats(): ChatMessage[] {
  return readDB().chats;
}

export function addChatMessage(sender: "student" | "companion", text: string): ChatMessage {
  const db = readDB();
  const newMessage: ChatMessage = {
    id: "msg-" + Date.now(),
    timestamp: new Date().toISOString(),
    sender,
    text,
  };
  db.chats.push(newMessage);
  writeDB(db);
  return newMessage;
}

export function clearChats(): void {
  const db = readDB();
  db.chats = [];
  writeDB(db);
}
