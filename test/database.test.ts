import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import path from "path";
import {
  getProfile,
  updateProfile,
  logMood,
  getMoods,
  addJournal,
  getJournals,
  updateJournalAnalysis,
} from "../server/database";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "wellness_db.json");

describe("Sarthi Database Layer & Session Isolation", () => {
  let originalDbContent = "";

  beforeAll(() => {
    // Save original database content if it exists
    if (fs.existsSync(DB_FILE)) {
      originalDbContent = fs.readFileSync(DB_FILE, "utf8");
    }
  });

  afterAll(() => {
    // Restore original database content
    if (originalDbContent) {
      fs.writeFileSync(DB_FILE, originalDbContent, "utf8");
    } else if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }
  });

  it("should isolate user profiles by userId", async () => {
    const userA = "user-a-" + Date.now();
    const userB = "user-b-" + Date.now();

    // 1. Get default profile for user A
    const profileA = await getProfile(userA);
    expect(profileA.name).toBe("Aspirant");

    // 2. Update profile for user A
    await updateProfile(userA, { name: "Ananya", targetExam: "NEET" });
    const updatedA = await getProfile(userA);
    expect(updatedA.name).toBe("Ananya");
    expect(updatedA.targetExam).toBe("NEET");

    // 3. User B should still get defaults
    const profileB = await getProfile(userB);
    expect(profileB.name).toBe("Aspirant");
  });

  it("should isolate mood registers by userId", async () => {
    const userA = "user-a-mood-" + Date.now();
    const userB = "user-b-mood-" + Date.now();

    // 1. Log mood for user A
    await logMood(userA, {
      moodScore: 8,
      stressScore: 3,
      contextTags: ["Self Study"],
      optionalNote: "Note A",
    });

    // 2. Log mood for user B
    await logMood(userB, {
      moodScore: 5,
      stressScore: 7,
      contextTags: ["Mock Exam Preparation"],
      optionalNote: "Note B",
    });

    // 3. Retrieve mood logs and assert isolation
    const moodsA = await getMoods(userA);
    // New users are pre-populated with 4 default items, so 4 defaults + 1 new = 5
    expect(moodsA.length).toBe(5);
    const loggedA = moodsA.find(m => m.optionalNote === "Note A");
    expect(loggedA).toBeDefined();
    expect(loggedA?.moodScore).toBe(8);

    const moodsB = await getMoods(userB);
    expect(moodsB.length).toBe(5);
    const loggedB = moodsB.find(m => m.optionalNote === "Note B");
    expect(loggedB).toBeDefined();
    expect(loggedB?.moodScore).toBe(5);
  });

  it("should save and update journal entries", async () => {
    const userId = "journal-user-" + Date.now();
    
    // Add journal
    const entry = await addJournal(userId, "I feel stressed about NEET boards revision.");
    expect(entry.entryText).toBe("I feel stressed about NEET boards revision.");
    expect(entry.analysisStatus).toBe("pending");

    // Retrieve journals (2 pre-populated defaults + 1 new = 3)
    const list = await getJournals(userId);
    expect(list.length).toBe(3);
    const logged = list.find(j => j.entryText === "I feel stressed about NEET boards revision.");
    expect(logged).toBeDefined();
    expect(logged?.id).toBe(entry.id);

    // Update analysis
    await updateJournalAnalysis(userId, entry.id, {
      analysisStatus: "completed",
      analysis: {
        sentiment: "Tense",
        stressLevel: "High",
        primaryTrigger: "Boards revision",
        triggerDescription: "Overburdened by boards mock schedule",
        empatheticSummary: "It is normal to feel high pressure.",
        copingStrategies: ["Coping 1", "Coping 2", "Coping 3"],
        isSafetyFlagged: false,
      },
    });

    const updatedList = await getJournals(userId);
    const updatedLogged = updatedList.find(j => j.id === entry.id);
    expect(updatedLogged?.analysisStatus).toBe("completed");
    expect(updatedLogged?.analysis?.sentiment).toBe("Tense");
  });
});
