import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  getProfile,
  updateProfile,
  getMoods,
  logMood,
  deleteMood,
  getJournals,
  addJournal,
  updateJournalAnalysis,
  getChats,
  addChatMessage,
  clearChats,
} from "./server/database";
import { analyzeJournalContent, getCompanionChatResponse } from "./server/geminiService";
import { ProfileSchema, MoodSchema, JournalSchema, ChatSchema } from "./server/validators.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// API Endpoints

// 1. Profile
app.get("/api/profile", (req, res) => {
  try {
    const profile = getProfile();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Failed to read student profile" });
  }
});

app.post("/api/profile", (req, res) => {
  try {
    const result = ProfileSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Invalid profile data", details: result.error.format() });
      return;
    }
    const updated = updateProfile(result.data);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update student profile" });
  }
});

// 2. Mood Logs
app.get("/api/moods", (req, res) => {
  try {
    const moods = getMoods();
    res.json(moods);
  } catch (err) {
    res.status(500).json({ error: "Failed to read mood logs" });
  }
});

app.post("/api/moods", (req, res) => {
  try {
    const result = MoodSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Invalid mood parameters", details: result.error.format() });
      return;
    }
    const saved = logMood(result.data);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: "Failed to save mood entry" });
  }
});

app.delete("/api/moods/:id", (req, res) => {
  try {
    const id = req.params.id;
    const deleted = deleteMood(id);
    if (deleted) {
      res.json({ success: true, message: "Logged mood cleared successfully." });
    } else {
      res.status(404).json({ error: "Mood entry not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to delete mood entry" });
  }
});

// 3. Journal Storage & Emotion Analysis
app.get("/api/journals", (req, res) => {
  try {
    const journals = getJournals();
    res.json(journals);
  } catch (err) {
    res.status(500).json({ error: "Failed to read journal list" });
  }
});

app.post("/api/journals/log", async (req, res) => {
  try {
    const result = JournalSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Invalid journal entry content", details: result.error.format() });
      return;
    }
    const { entryText, associatedMoodId } = result.data;

    // 1. Store initial journal with pending status
    const initialJournal = addJournal(entryText, associatedMoodId);

    // 2. Drive Gemini Analysis
    try {
      const liveAnalysis = await analyzeJournalContent(entryText);
      const finalized = updateJournalAnalysis(initialJournal.id, {
        analysisStatus: "completed",
        analysis: liveAnalysis,
      });
      res.json(finalized);
    } catch (analysisError) {
      console.error("Failed to run Gemini analysis, marking as failed:", analysisError);
      const failedEntry = updateJournalAnalysis(initialJournal.id, {
        analysisStatus: "failed",
      });
      res.json(failedEntry);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to save and analyze journal" });
  }
});

// 4. Companion Chat
app.get("/api/chats", (req, res) => {
  try {
    const chats = getChats();
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to load peer support chat history" });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const result = ChatSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Message content is invalid", details: result.error.format() });
      return;
    }
    const { text } = result.data;

    // Append student message
    addChatMessage("student", text);

    const profile = getProfile();
    const chats = getChats();

    // Map history to standard Gemini chat structure (with user / model roles)
    // Keep last 15 messages so as not to overwhelm memory context or token limit
    const recentMessages = chats.slice(-15);
    const apiHistory = recentMessages.slice(0, -1).map((msg) => ({
      role: msg.sender === "student" ? ("user" as const) : ("model" as const),
      parts: [{ text: msg.text }],
    }));

    // Procure companion response
    const aiResponse = await getCompanionChatResponse(text, apiHistory, profile);

    // Save and append peer response
    addChatMessage("companion", aiResponse);

    res.json({
      response: aiResponse,
      history: getChats(),
    });
  } catch (err) {
    console.error("Chat companion pipeline error:", err);
    res.status(500).json({ error: "Failed to process AI counselor answer" });
  }
});

app.post("/api/chat/clear", (req, res) => {
  try {
    clearChats();
    res.json({ success: true, history: [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to flush peer chat history" });
  }
});

// Vite Middleware & Static Serves

async function hookVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Vite booting in development middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`Vite booting in production mode, serving: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Student Wellness Companion server operational on http://localhost:${PORT}`);
  });
}

hookVite().catch((err) => {
  console.error("Failed to boot companion backend server stack:", err);
});
