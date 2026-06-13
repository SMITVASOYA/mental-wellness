import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "wellness_db.json");

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
let supabase: any = null;

if (isSupabaseConfigured) {
  console.log("Sarthi Backend: Supabase credentials found. Running database on Supabase PostgreSQL.");
  try {
    supabase = createClient(supabaseUrl!, supabaseAnonKey!);
  } catch (err) {
    console.error("Failed to initialize Supabase client, falling back to local storage:", err);
    supabase = null;
  }
} else {
  console.warn("Sarthi Backend: SUPABASE_URL / SUPABASE_ANON_KEY missing. Falling back to local JSON database.");
}

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

interface UserData {
  profile: UserProfile;
  moods: MoodEntry[];
  journals: JournalEntry[];
  chats: ChatMessage[];
}

interface MultiUserDBStructure {
  [userId: string]: UserData;
}

const DEFAULT_DB: UserData = {
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

function readDB(): MultiUserDBStructure {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
    const initialDb = { "anonymous-default-user": DEFAULT_DB };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf8");
    return initialDb;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(data);
    
    // Support migrating old single-user database structure
    if (parsed && ("profile" in parsed || "moods" in parsed)) {
      console.log("Sarthi DB: Migrating database format to multi-user support...");
      const migrated = {
        "anonymous-default-user": {
          profile: parsed.profile || DEFAULT_DB.profile,
          moods: parsed.moods || DEFAULT_DB.moods,
          journals: parsed.journals || DEFAULT_DB.journals,
          chats: parsed.chats || DEFAULT_DB.chats,
        }
      };
      writeDB(migrated);
      return migrated;
    }
    return parsed;
  } catch (err) {
    console.error("Failed to read database, falling back to default:", err);
    return { "anonymous-default-user": DEFAULT_DB };
  }
}

function writeDB(db: MultiUserDBStructure) {
  ensureDir();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to database file:", err);
  }
}

function getUserData(db: MultiUserDBStructure, userId: string): UserData {
  if (!db[userId]) {
    // Populate new users with the mock database values for demonstration purposes
    db[userId] = JSON.parse(JSON.stringify(DEFAULT_DB));
    writeDB(db);
  }
  return db[userId];
}

// 1. Profile Service APIs
export async function getProfile(userId: string): Promise<UserProfile> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (error) {
        if (error.code === "PGRST116") { // row not found
          const newProfile = { id: userId, name: "Aspirant", target_exam: "JEE", study_hours_goal: 8 };
          await supabase.from("profiles").insert(newProfile);
          return { name: newProfile.name, targetExam: newProfile.target_exam, studyHoursGoal: newProfile.study_hours_goal };
        }
        throw error;
      }
      return {
        name: data.name,
        targetExam: data.target_exam,
        studyHoursGoal: data.study_hours_goal,
      };
    } catch (err) {
      console.error("Supabase getProfile failed, using JSON fallback:", err);
    }
  }
  // Local JSON fallback
  const db = readDB();
  return getUserData(db, userId).profile;
}

export async function updateProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
  if (supabase) {
    try {
      const dbProfile = {
        name: profile.name,
        target_exam: profile.targetExam,
        study_hours_goal: profile.studyHoursGoal,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from("profiles")
        .update(dbProfile)
        .eq("id", userId);
        
      if (error) throw error;
      return await getProfile(userId);
    } catch (err) {
      console.error("Supabase updateProfile failed, using JSON fallback:", err);
    }
  }
  // Local JSON fallback
  const db = readDB();
  const userData = getUserData(db, userId);
  userData.profile = { ...userData.profile, ...profile };
  writeDB(db);
  return userData.profile;
}

// 2. Mood Service APIs
export async function getMoods(userId: string): Promise<MoodEntry[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false });
        
      if (error) throw error;
      return data.map((d: any) => ({
        id: d.id,
        timestamp: d.timestamp,
        moodScore: d.mood_score,
        stressScore: d.stress_score,
        contextTags: d.context_tags,
        optionalNote: d.optional_note,
      }));
    } catch (err) {
      console.error("Supabase getMoods failed, using JSON fallback:", err);
    }
  }
  // Local JSON fallback
  const db = readDB();
  const userData = getUserData(db, userId);
  return [...userData.moods].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function logMood(userId: string, entry: Omit<MoodEntry, "id" | "timestamp">): Promise<MoodEntry> {
  const newId = "mood-" + Date.now();
  const timestamp = new Date().toISOString();

  if (supabase) {
    try {
      const dbEntry = {
        id: newId,
        user_id: userId,
        mood_score: entry.moodScore,
        stress_score: entry.stressScore,
        context_tags: entry.contextTags,
        optional_note: entry.optionalNote,
        timestamp
      };
      
      const { error } = await supabase.from("mood_entries").insert(dbEntry);
      if (error) throw error;
      
      return {
        ...entry,
        id: newId,
        timestamp
      };
    } catch (err) {
      console.error("Supabase logMood failed, using JSON fallback:", err);
    }
  }
  // Local JSON fallback
  const db = readDB();
  const userData = getUserData(db, userId);
  const newEntry: MoodEntry = {
    ...entry,
    id: newId,
    timestamp,
  };
  userData.moods.push(newEntry);
  writeDB(db);
  return newEntry;
}

export async function deleteMood(userId: string, id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error, count } = await supabase
        .from("mood_entries")
        .delete({ count: "exact" })
        .eq("id", id)
        .eq("user_id", userId);
        
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase deleteMood failed, using JSON fallback:", err);
    }
  }
  // Local JSON fallback
  const db = readDB();
  const userData = getUserData(db, userId);
  const initialLength = userData.moods.length;
  userData.moods = userData.moods.filter((m) => m.id !== id);
  if (userData.moods.length < initialLength) {
    writeDB(db);
    return true;
  }
  return false;
}

// 3. Journal Service APIs
export async function getJournals(userId: string): Promise<JournalEntry[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false });
        
      if (error) throw error;
      return data.map((d: any) => ({
        id: d.id,
        timestamp: d.timestamp,
        entryText: d.entry_text,
        associatedMoodId: d.associated_mood_id,
        analysisStatus: d.analysis_status,
        analysis: d.analysis,
      }));
    } catch (err) {
      console.error("Supabase getJournals failed, using JSON fallback:", err);
    }
  }
  // Local JSON fallback
  const db = readDB();
  const userData = getUserData(db, userId);
  return [...userData.journals].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function addJournal(userId: string, entryText: string, associatedMoodId?: string): Promise<JournalEntry> {
  const newId = "journal-" + Date.now();
  const timestamp = new Date().toISOString();

  if (supabase) {
    try {
      const dbEntry = {
        id: newId,
        user_id: userId,
        entry_text: entryText,
        associated_mood_id: associatedMoodId || null,
        analysis_status: "pending",
        timestamp
      };
      
      const { error } = await supabase.from("journal_entries").insert(dbEntry);
      if (error) throw error;
      
      return {
        id: newId,
        timestamp,
        entryText,
        associatedMoodId,
        analysisStatus: "pending"
      };
    } catch (err) {
      console.error("Supabase addJournal failed, using JSON fallback:", err);
    }
  }
  // Local JSON fallback
  const db = readDB();
  const userData = getUserData(db, userId);
  const newEntry: JournalEntry = {
    id: newId,
    timestamp,
    entryText,
    associatedMoodId,
    analysisStatus: "pending"
  };
  userData.journals.push(newEntry);
  writeDB(db);
  return newEntry;
}

export async function updateJournalAnalysis(
  userId: string,
  id: string,
  update: { analysisStatus: "completed" | "failed"; analysis?: JournalAnalysis }
): Promise<JournalEntry | null> {
  if (supabase) {
    try {
      const dbUpdate = {
        analysis_status: update.analysisStatus,
        analysis: update.analysis || null,
      };
      
      const { error } = await supabase
        .from("journal_entries")
        .update(dbUpdate)
        .eq("id", id)
        .eq("user_id", userId);
        
      if (error) throw error;
      
      const { data } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("id", id)
        .single();
        
      return data ? {
        id: data.id,
        timestamp: data.timestamp,
        entryText: data.entry_text,
        associatedMoodId: data.associated_mood_id,
        analysisStatus: data.analysis_status,
        analysis: data.analysis,
      } : null;
    } catch (err) {
      console.error("Supabase updateJournalAnalysis failed, using JSON fallback:", err);
    }
  }
  // Local JSON fallback
  const db = readDB();
  const userData = getUserData(db, userId);
  const idx = userData.journals.findIndex((j) => j.id === id);
  if (idx !== -1) {
    userData.journals[idx] = {
      ...userData.journals[idx],
      ...update
    };
    writeDB(db);
    return userData.journals[idx];
  }
  return null;
}

// 4. Companion Chat Service APIs
export async function getChats(userId: string): Promise<ChatMessage[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: true });
        
      if (error) throw error;
      return data.map((d: any) => ({
        id: d.id,
        timestamp: d.timestamp,
        sender: d.sender,
        text: d.text,
      }));
    } catch (err) {
      console.error("Supabase getChats failed, using JSON fallback:", err);
    }
  }
  // Local JSON fallback
  const db = readDB();
  return getUserData(db, userId).chats;
}

export async function addChatMessage(userId: string, sender: "student" | "companion", text: string): Promise<ChatMessage> {
  const newId = "msg-" + Date.now();
  const timestamp = new Date().toISOString();

  if (supabase) {
    try {
      const dbMsg = {
        id: newId,
        user_id: userId,
        sender,
        text,
        timestamp
      };
      
      const { error } = await supabase.from("chat_messages").insert(dbMsg);
      if (error) throw error;
      
      return {
        id: newId,
        timestamp,
        sender,
        text,
      };
    } catch (err) {
      console.error("Supabase addChatMessage failed, using JSON fallback:", err);
    }
  }
  // Local JSON fallback
  const db = readDB();
  const userData = getUserData(db, userId);
  const newMessage: ChatMessage = {
    id: newId,
    timestamp,
    sender,
    text,
  };
  userData.chats.push(newMessage);
  writeDB(db);
  return newMessage;
}

export async function clearChats(userId: string): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("user_id", userId);
        
      if (error) throw error;
      return;
    } catch (err) {
      console.error("Supabase clearChats failed, using JSON fallback:", err);
    }
  }
  // Local JSON fallback
  const db = readDB();
  const userData = getUserData(db, userId);
  userData.chats = [];
  writeDB(db);
}
