import { describe, it, expect } from "vitest";
import {
  ProfileSchema,
  MoodSchema,
  JournalSchema,
  ChatSchema,
  JournalAnalysisSchema,
} from "../server/validators";

describe("Sarthi Server Validators", () => {
  describe("ProfileSchema", () => {
    it("should accept valid profile configurations", () => {
      const valid = {
        name: "Test Aspirant",
        targetExam: "JEE",
        studyHoursGoal: 8,
      };
      expect(ProfileSchema.safeParse(valid).success).toBe(true);
    });

    it("should reject invalid hour ranges", () => {
      const tooLow = {
        name: "Test",
        targetExam: "UPSC",
        studyHoursGoal: 0,
      };
      const tooHigh = {
        name: "Test",
        targetExam: "NEET",
        studyHoursGoal: 25,
      };
      expect(ProfileSchema.safeParse(tooLow).success).toBe(false);
      expect(ProfileSchema.safeParse(tooHigh).success).toBe(false);
    });
  });

  describe("MoodSchema", () => {
    it("should accept score values between 1 and 10", () => {
      const valid = {
        moodScore: 7,
        stressScore: 4,
        contextTags: ["Mock Exam Preparation"],
        optionalNote: "Revision session",
      };
      expect(MoodSchema.safeParse(valid).success).toBe(true);
    });

    it("should fail validation for numbers outside 1-10", () => {
      const tooLow = { moodScore: 0, stressScore: 5 };
      const tooHigh = { moodScore: 11, stressScore: 6 };
      expect(MoodSchema.safeParse(tooLow).success).toBe(false);
      expect(MoodSchema.safeParse(tooHigh).success).toBe(false);
    });
  });

  describe("JournalSchema", () => {
    it("should reject empty journal entries", () => {
      const invalid = { entryText: "" };
      expect(JournalSchema.safeParse(invalid).success).toBe(false);
    });

    it("should accept typical student journals", () => {
      const valid = { entryText: "Optics formulas revision completed.", associatedMoodId: "mood-1" };
      expect(JournalSchema.safeParse(valid).success).toBe(true);
    });
  });

  describe("ChatSchema", () => {
    it("should enforce non-empty chat messages", () => {
      expect(ChatSchema.safeParse({ text: "" }).success).toBe(false);
      expect(ChatSchema.safeParse({ text: "Hello!" }).success).toBe(true);
    });
  });

  describe("JournalAnalysisSchema", () => {
    it("should validate strict Gemini JSON formats", () => {
      const validAnalysis = {
        sentiment: "Tense over Maths",
        stressLevel: "High",
        primaryTrigger: "Syllabus backlog",
        triggerDescription: "Overwhelmed by calculus chapters remaining",
        empatheticSummary: "It is normal to feel pressured by the pace of maths revision.",
        copingStrategies: [
          "Chunk revision into 20-minute daily blocks.",
          "Perform a box breathing loop inside Sarthi.",
          "Keep focus logged in your database dashboard."
        ],
        isSafetyFlagged: false,
      };
      expect(JournalAnalysisSchema.safeParse(validAnalysis).success).toBe(true);
    });

    it("should reject analysis with incorrect number of coping strategies", () => {
      const invalidAnalysis = {
        sentiment: "Tense",
        stressLevel: "Low",
        primaryTrigger: "Backlog",
        triggerDescription: "Calculus backlog",
        empatheticSummary: "Heard.",
        copingStrategies: ["Just one strategy"],
        isSafetyFlagged: false,
      };
      expect(JournalAnalysisSchema.safeParse(invalidAnalysis).success).toBe(false);
    });
  });
});
