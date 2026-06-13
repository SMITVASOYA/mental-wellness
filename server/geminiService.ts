import { GoogleGenAI, Type } from "@google/genai";
import { JournalAnalysis } from "./database.js";
import { JournalAnalysisSchema } from "./validators.js";

// Helper to check if API key exists
const apiKey = process.env.GEMINI_API_KEY;

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined. Falling back to empathetic local rule-based simulation.");
    return null;
  }
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Failed to initialize GoogleGenAI client:", err);
      return null;
    }
  }
  return aiClient;
}

// Fallback simulator for when API Key is missing (keeps app fully usable with dummy credentials)
function runFallbackAnalysis(entryText: string): JournalAnalysis {
  const lower = entryText.toLowerCase();
  
  // Basic trigger mapping for mock simulation
  let sentiment = "Meditative & Thoughtful";
  let stressLevel: "Low" | "Medium" | "High" | "Critical" = "Medium";
  let primaryTrigger = "General Preparation Exhaustion";
  let triggerDescription = "Gradual accumulation of long study hours without active restoration periods.";
  let copingStrategies = [
    "Practice Box Breathing (Inhale 4s, Hold 4s, Exhale 4s, Hold 4s) right now in the breathing tab.",
    "Declutter your desk: Keep only one physics/chemistry book in sight for the next 2 hours.",
    "Take a structured 15-minute screen-free walks after your next revision interval."
  ];
  let isSafetyFlagged = false;

  if (lower.includes("suicide") || lower.includes("self-harm") || lower.includes("kill myself") || lower.includes("ending it") || lower.includes("die")) {
    sentiment = "Crisis Triggered";
    stressLevel = "Critical";
    primaryTrigger = "Severe Stress/Hopelessness";
    triggerDescription = "Expressions of despair or desire to end suffering require immediate human support resources.";
    copingStrategies = [
      "Please pause studying now. Your health and survival are infinitely more precious than any rank.",
      "Reach out directly to your parents, a trusted mentor, or a professional guidance officer.",
      "Call the AASRA National Helpline (24/7) at +91-9820466726, or Tele-MANAS at 14416."
    ];
    isSafetyFlagged = true;
  } else if (lower.includes("fail") || lower.includes("marks") || lower.includes("score") || lower.includes("mock") || lower.includes("test")) {
    sentiment = "Test Anxiety & Self-Evaluation Panic";
    stressLevel = "High";
    primaryTrigger = "Mock Exam Assessment Backlash";
    triggerDescription = "A sudden decline or high volatility in mock exam scores generates intense pressure on self-worth.";
    copingStrategies = [
      "Isolate exact syllabus errors: Mark down which 3 topics cost you marks, rather than labeling entire science sections as failures.",
      "Score-worth separation: Recite 'Mocks are diagnostic toolkits, not final statements of my lifetime intelligence.'",
      "Limit mock exams to maximum one per week to allow enough downtime to fully absorb explanations."
    ];
  } else if (lower.includes("compet") || lower.includes("rohan") || lower.includes("friend") || lower.includes("other") || lower.includes("rank") || lower.includes("percentile")) {
    sentiment = "Comparison Burnout";
    stressLevel = "High";
    primaryTrigger = "Peer Comparison & Percentile Stress";
    triggerDescription = "Checking the syllabus coverage or target ranks of classmates triggers self-efficacy collapse.";
    copingStrategies = [
      "Digital blackout: Mute peer study groups on Telegram/WhatsApp for 48 hours.",
      "Acknowledge different tracks: Your study velocity and preparation curve are entirely unique.",
      "Discuss mock queries only with your direct tutor instead of classmates."
    ];
  } else if (lower.includes("parent") || lower.includes("family") || lower.includes("father") || lower.includes("mother") || lower.includes("expect")) {
    sentiment = "Pressure of Expectations";
    stressLevel = "High";
    primaryTrigger = "Family Accountability Pressure";
    triggerDescription = "Internalizing real or perceived parental expectations leads to study paralysis from fear of causing disappointment.";
    copingStrategies = [
      "Schedule a 10-minute non-study conversation with your parents today (discuss dinner, historical facts, or films).",
      "Remember that parental worry is natural, but their love is not conditional on your UPSC/JEE percentile.",
      "Write a micro-journal entry specifically thanking yourself for your daily efforts."
    ];
  } else if (lower.includes("tired") || lower.includes("fatigue") || lower.includes("sleep") || lower.includes("exhaust") || lower.includes("headache")) {
    sentiment = "Physical Burnout & Cognitive Fatigue";
    stressLevel = "High";
    primaryTrigger = "Sleep Deprivation and Extended Screen Exposure";
    triggerDescription = "Studying past midnight without standard sleep cycles drains cerebral glucose and impairs logical processing.";
    copingStrategies = [
      "Set an absolute 'screens off' alarm 45 minutes before bedtime.",
      "Replace late-night high-stimulant revision with warm green tea and quiet visual relaxation.",
      "Aim for a minimum of 6.5 hours of continuous night sleep to protect working memory storage."
    ];
  }

  return {
    sentiment,
    stressLevel,
    primaryTrigger,
    triggerDescription,
    empatheticSummary: `[Fallback Mode Analysis] We detected stress themes regarding your exam preparation. ${triggerDescription}`,
    copingStrategies,
    isSafetyFlagged
  };
}

// 1. Analyze user journals securely via Gemini 3.5 Flash
export async function analyzeJournalContent(entryText: string): Promise<JournalAnalysis> {
  const client = getAIClient();
  if (!client) {
    return runFallbackAnalysis(entryText);
  }

  try {
    const systemPrompt = `You are an expert student psychologist and exam stress advisor specializing in high-stakes competitive tests (like JEE, NEET, UPSC, GATE, CAT, etc.).
Analyze the student's personal journal entry to understand their emotional burden, syllabus distress, study blockages, family peer-pressure state, or self-harm/safety signals.

Categorize and evaluate:
1. Sentiment (e.g., 'Anxious Mock-Test Backlash', 'Peer-Comparison Paralysis', 'Exhausted Syllabus Backlog', 'Motivated yet Tired', 'Hopeless and Panicked'). Keep it realistic and empathetic.
2. Stress Level ('Low' | 'Medium' | 'High' | 'Critical'). Select exactly one.
3. Primary Trigger (Identify the exact source, e.g., 'Low score in chemistry mock', 'Telegram study group comparison', 'Midnight study burnout', 'Parental target expectations').
4. Trigger Description (Provide a 1-phrase explanation of why this specific factor triggers stress).
5. Empathetic Summary (Provide a warm, supportive, validating 1-to-2 sentence analysis as a counselor).
6. Coping Strategies (List exactly 3 hyper-practical, exam-student specific coping tips, styled as immediate actionable steps. E.g., 'Mute Telegram study group', 'Isolate 3 sub-chapters instead of entire integration syllabus', 'Try box breathing for 2 minutes before the test mock').
7. isSafetyFlagged (Check if the student displays severe self-harm plans, deep suicidal thoughts, or critical safety risks. Set to true ONLY if there are genuine risk markers).

Return results strictly in the structured JSON schema defined. Do not include any standard conversational preamble or code blocks.`;

    const result = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Student journal entry: "${entryText}"`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1, // low temperature for precise classification and validation
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { 
              type: Type.STRING,
              description: "Empathetic emotional state, e.g. 'Panicked over Physics marks'"
            },
            stressLevel: { 
              type: Type.STRING,
              enum: ["Low", "Medium", "High", "Critical"],
              description: "Graded overall pressure"
            },
            primaryTrigger: { 
              type: Type.STRING, 
              description: "The core reason for stress identified in text" 
            },
            triggerDescription: { 
              type: Type.STRING,
              description: "Underlying cause explanation for trigger"
            },
            empatheticSummary: { 
              type: Type.STRING,
              description: "A kind validation statement confirming the student is heard"
            },
            copingStrategies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 3 distinct, exam-student actions"
            },
            isSafetyFlagged: { 
              type: Type.BOOLEAN,
              description: "Set to TRUE if there is any serious suicidal or physical self-harm intention mentioned"
            }
          },
          required: ["sentiment", "stressLevel", "primaryTrigger", "triggerDescription", "empatheticSummary", "copingStrategies", "isSafetyFlagged"]
        }
      }
    });

    const parsedText = result.text.trim();
    const parsedJson = JSON.parse(parsedText);
    
    // Validate schema with Zod
    const validated = JournalAnalysisSchema.parse(parsedJson);
    return validated;
  } catch (error) {
    console.error("Error analyzing journal with Gemini:", error);
    return runFallbackAnalysis(entryText);
  }
}

// 2. Chat with Companion (Empathy chatbot)
export async function getCompanionChatResponse(
  studentMessage: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  profile: { name: string; targetExam: string }
): Promise<string> {
  const client = getAIClient();
  if (!client) {
    return simulateFallbackChatResponse(studentMessage, profile);
  }

  try {
    const chatModel = "gemini-2.5-flash";
    
    // Setup a clean system context for our compassionate peer guide
    const systemInstruction = `You are "Sarthi" (Empathetic Companion), a brilliant, kind-hearted peer mentor and mindfulness coach for students preparing for high-stakes exams (like JEE, NEET, UPSC, CAT, GATE).
Your conversational tone is gentle, warm, supportive, and grounded in human connection. You are NOT a licensed therapist (and must make no diagnostic medical claims), but rather an encouraging elder sibling who has walked the same hard academic paths.

Guidelines for your dialogue:
1. Speak with genuine empathy. Validate their pressure immediately. Use labels like "I hear you, ${profile.name}" or "That mocks slip triggers classic panic, but it's totally restorable."
2. Never solve equations or provide academic homework sheets. If they ask academic questions, politely say: "I am here to protect your mind and focus! Let's handle your study blockages, and we can leave the equations for your books."
3. Keep answers compact, clear, and comforting. Suggest realistic mindfulness adjustments (like a 2-minute break, a box-breathing release, stretching, or writing out syllabus subcategories).
4. If the message indicates a severe crisis or self-harm risk, warmly divert them, emphasize their priceless life value, and invite them to unlock the helpline coordinates instantly.`;

    // Make a direct generation call using system instructions and previous chat history format
    const contentsPayload = [
      ...history.map(h => ({
        role: h.role,
        parts: h.parts
      })),
      {
        role: "user" as const,
        parts: [{ text: studentMessage }]
      }
    ];

    const response = await client.models.generateContent({
      model: chatModel,
      contents: contentsPayload,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // warmer temperature for natural conversational comfort
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error in Gemini companion chat:", error);
    return simulateFallbackChatResponse(studentMessage, profile);
  }
}

function simulateFallbackChatResponse(message: string, profile: { name: string; targetExam: string }): string {
  const lower = message.toLowerCase();
  
  if (lower.includes("suicide") || lower.includes("self-harm") || lower.includes("kill myself") || lower.includes("die")) {
    return `Oh, ${profile.name}, please pause and rest. Your life is infinitely more valuable than any rank or test score. I need you to promise me you'll stop studying right now and tell someone you trust. Please call a helpline immediately like Tele-MANAS at 14416 or AASRA at +91-9820466726. You don't have to carry this alone.`;
  }
  
  if (lower.includes("mock") || lower.includes("score") || lower.includes("fail") || lower.includes("marks")) {
    return `I hear you, ${profile.name}. A drop in mock scores is tough, but remember: mocks are just warning lights on your dashboard. They show you where to patch your circuits, not what your final result will be. Take a deep breath. Which specific syllabus corner felt most confusing in today's mock? Let's take it in tiny, digestible steps.`;
  }

  if (lower.includes("parent") || lower.includes("father") || lower.includes("mother") || lower.includes("pressure")) {
    return `The pressure of parental expectations is incredibly heavy, ${profile.name}. Most of the time, they worry because they care, but they might not realize how much pressure their words create. You are putting in real effort every single day. Let's practice a brief box-breathing exercise to reset your pulse before you return to the desk.`;
  }

  if (lower.includes("tired") || lower.includes("sleep") || lower.includes("exhaust")) {
    return `That brain fatigue is real, ${profile.name}. When your mind gets exhausted, trying to stuff more organic chemistry or physics formulas in is like trying to write on water. Let's do a 5-minute screen-free pause. Get up, drink a glass of water, and stretch your shoulders. You've worked hard today.`;
  }

  return `I completely hear you, ${profile.name}. Preparing for ${profile.targetExam} is an athletic marathon for the mind. It is completely normal to feel overwhelmed, but you are taking it step-by-step. Remember to look at how far you have already come. What is your primary study focus for the next block, and how can I help you clear your mind for it?`;
}
