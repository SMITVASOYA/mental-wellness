export interface UserProfile {
  name: string;
  targetExam: string;
  studyHoursGoal: number;
}

export interface MoodEntry {
  id: string;
  timestamp: string;
  moodScore: number;
  stressScore: number;
  contextTags: string[];
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
