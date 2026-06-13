import { UserProfile, MoodEntry, JournalEntry, ChatMessage } from "../types";

export const apiService = {
  async getProfile(): Promise<UserProfile> {
    const res = await fetch("/api/profile");
    if (!res.ok) throw new Error("Failed to load profile");
    return res.json();
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to update profile");
    }
    return res.json();
  },

  async getMoods(): Promise<MoodEntry[]> {
    const res = await fetch("/api/moods");
    if (!res.ok) throw new Error("Failed to load moods");
    return res.json();
  },

  async logMood(entry: {
    moodScore: number;
    stressScore: number;
    contextTags: string[];
    optionalNote: string;
  }): Promise<MoodEntry> {
    const res = await fetch("/api/moods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to log mood");
    }
    return res.json();
  },

  async deleteMood(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/moods/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to delete mood entry");
    }
    return res.json();
  },

  async getJournals(): Promise<JournalEntry[]> {
    const res = await fetch("/api/journals");
    if (!res.ok) throw new Error("Failed to load journal directory");
    return res.json();
  },

  async logJournal(entryText: string, associatedMoodId?: string): Promise<JournalEntry> {
    const res = await fetch("/api/journals/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryText, associatedMoodId }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to submit and analyze journal");
    }
    return res.json();
  },

  async getChats(): Promise<ChatMessage[]> {
    const res = await fetch("/api/chats");
    if (!res.ok) throw new Error("Failed to load companion chat history");
    return res.json();
  },

  async sendChat(text: string): Promise<{ response: string; history: ChatMessage[] }> {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to transmit message");
    }
    return res.json();
  },

  async clearChats(): Promise<{ success: boolean; history: ChatMessage[] }> {
    const res = await fetch("/api/chat/clear", {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to clear chat log");
    return res.json();
  },
};
