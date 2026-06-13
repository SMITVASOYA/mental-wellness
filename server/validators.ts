import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  targetExam: z.string().min(1, "Exam name is required").max(100),
  studyHoursGoal: z.number().min(1, "Goal must be at least 1 hour").max(24, "Goal cannot exceed 24 hours"),
});

export const MoodSchema = z.object({
  moodScore: z.number().min(1).max(10),
  stressScore: z.number().min(1).max(10),
  contextTags: z.array(z.string()).default([]),
  optionalNote: z.string().max(2000).default(""),
});

export const JournalSchema = z.object({
  entryText: z.string().min(1, "Journal text is required").max(10000),
  associatedMoodId: z.string().optional(),
});

export const ChatSchema = z.object({
  text: z.string().min(1, "Chat message is required").max(5000),
});

export const JournalAnalysisSchema = z.object({
  sentiment: z.string().min(1),
  stressLevel: z.enum(["Low", "Medium", "High", "Critical"]),
  primaryTrigger: z.string().min(1),
  triggerDescription: z.string().min(1),
  empatheticSummary: z.string().min(1),
  copingStrategies: z.array(z.string()).length(3),
  isSafetyFlagged: z.boolean(),
});
