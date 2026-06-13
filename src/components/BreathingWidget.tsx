import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Heart, ShieldAlert, Sparkles, Wind } from "lucide-react";

interface BreathingStyle {
  name: string;
  description: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
}

const BREATH_STYLES: BreathingStyle[] = [
  {
    name: "Classic Box Breathing",
    description: "Standard Navy SEAL method to immediately shut down physiological panic or exam-hall sweat.",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
  },
  {
    name: "Calming 4-7-8 Loop",
    description: "Deep somatic reset, highly recommended before sleep or when tackling severe subject backlog stress.",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
  },
  {
    name: "Quick Brain Energizer",
    description: "Short breaths to restore oxygen flow, clear cognitive fog, and overcome study drowsiness.",
    inhale: 3,
    hold1: 1,
    exhale: 3,
    hold2: 1,
  }
];

type BreathPhase = "Inhale" | "Hold" | "Exhale" | "Rest";

export default function BreathingWidget() {
  const [selectedStyle, setSelectedStyle] = useState<BreathingStyle>(BREATH_STYLES[0]);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("Inhale");
  const [timeLeft, setTimeLeft] = useState(selectedStyle.inhale);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Restart session if technique changes
  useEffect(() => {
    setIsActive(false);
    setPhase("Inhale");
    setTimeLeft(selectedStyle.inhale);
  }, [selectedStyle]);

  // Main respiration loop
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Progress to next phase
          setPhase((currentPhase) => {
            switch (currentPhase) {
              case "Inhale":
                if (selectedStyle.hold1 > 0) {
                  setTimeLeft(selectedStyle.hold1);
                  return "Hold";
                } else {
                  setTimeLeft(selectedStyle.exhale);
                  return "Exhale";
                }
              case "Hold":
                setTimeLeft(selectedStyle.exhale);
                return "Exhale";
              case "Exhale":
                if (selectedStyle.hold2 > 0) {
                  setTimeLeft(selectedStyle.hold2);
                  return "Rest";
                } else {
                  setCyclesCompleted((c) => c + 1);
                  setTimeLeft(selectedStyle.inhale);
                  return "Inhale";
                }
              case "Rest":
                setCyclesCompleted((c) => c + 1);
                setTimeLeft(selectedStyle.inhale);
                return "Inhale";
              default:
                return "Inhale";
            }
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase, selectedStyle]);

  const toggleSession = () => {
    setIsActive(!isActive);
  };

  const resetSession = () => {
    setIsActive(false);
    setPhase("Inhale");
    setTimeLeft(selectedStyle.inhale);
    setCyclesCompleted(0);
  };

  // Determine scale metrics for CSS transitions
  const getCircleScaleAndColor = () => {
    if (!isActive) return { scale: "scale-75", bg: "bg-slate-700/60 border-slate-600", text: "text-slate-400", label: "Ready to begin" };
    switch (phase) {
      case "Inhale":
        return { scale: "scale-110 duration-[4000ms]", bg: "bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/10", text: "text-emerald-400", label: "Breathe In Slowly..." };
      case "Hold":
        return { scale: "scale-110 duration-[7000ms]", bg: "bg-indigo-500/20 border-indigo-400 shadow-lg shadow-indigo-500/10", text: "text-indigo-400", label: "Suspend Breath..." };
      case "Exhale":
        return { scale: "scale-75 duration-[8000ms]", bg: "bg-rose-500/20 border-rose-400 shadow-lg shadow-rose-500/10", text: "text-rose-400", label: "Release Breath Out..." };
      case "Rest":
        return { scale: "scale-75 duration-[4000ms]", bg: "bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/10", text: "text-amber-400", label: "Pause and Relax..." };
    }
  };

  const statePulse = getCircleScaleAndColor();

  return (
    <div
      id="breathing-reset-section"
      className="p-6 bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl mx-auto shadow-2xl"
      aria-label="Somatic Respiration and Breathing Reset Area"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400" aria-hidden="true">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-100 font-sans tracking-tight">Somatic Reset Station</h2>
            <p className="text-xs text-slate-400">Calm your amygdala during hectic exam revision shifts</p>
          </div>
        </div>
        <div
          className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300 flex items-center space-x-1.5"
          aria-live="polite"
          aria-label={`${cyclesCompleted} breathing cycles completed`}
        >
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" aria-hidden="true" />
          <span>Cycles: {cyclesCompleted}</span>
        </div>
      </div>

      {/* Breathing Style Selectors */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8"
        role="radiogroup"
        aria-label="Select breathing technique style"
      >
        {BREATH_STYLES.map((style) => {
          const isSelected = selectedStyle.name === style.name;
          return (
            <button
              key={style.name}
              onClick={() => setSelectedStyle(style)}
              disabled={isActive}
              role="radio"
              aria-checked={isSelected}
              className={`p-3 text-left rounded-xl transition duration-200 border text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isSelected
                  ? "bg-emerald-500/5 text-emerald-300 border-emerald-500/50"
                  : "bg-slate-800/50 text-slate-300 border-slate-800/80 hover:bg-slate-800 hover:border-slate-700"
              } ${isActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              aria-label={`${style.name}: ${style.description}. Inhale for ${style.inhale} seconds, hold for ${style.hold1} seconds, exhale for ${style.exhale} seconds.`}
            >
              <div className="font-medium text-sm mb-1 text-slate-200">{style.name}</div>
              <div className="text-[11px] text-slate-400 line-clamp-2">{style.description}</div>
              <div className="mt-2 text-[10px] text-slate-500 font-mono" aria-hidden="true">
                In: {style.inhale}s | Hold: {style.hold1}s | Out: {style.exhale}s {style.hold2 > 0 ? `| Rest: ${style.hold2}s` : ""}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Visual Respiration Circle */}
      <div className="relative flex flex-col items-center justify-center p-8 bg-slate-950/40 border border-slate-800/60 rounded-2xl mb-6 min-h-[300px]">
        {/* Core Bubble Animation scale mapped via Tailwind duration helper */}
        <div
          className={`w-48 h-48 rounded-full border-2 flex items-center justify-center flex-col transform transition-transform ease-in-out ${statePulse.scale} ${statePulse.bg}`}
          aria-live="assertive"
          aria-label={isActive ? `Respiration timer: ${timeLeft} seconds left in ${phase} phase` : "Breathing circle ready"}
        >
          {isActive ? (
            <>
              <div className={`text-3xl font-mono font-bold ${statePulse.text}`} aria-hidden="true">{timeLeft}s</div>
              <div className="text-[11px] uppercase tracking-widest text-slate-400 mt-1" aria-hidden="true">{phase}</div>
            </>
          ) : (
            <div className="text-slate-400 text-center px-4 leading-normal text-xs" aria-hidden="true">
              <Sparkles className="w-5 h-5 mx-auto mb-2 text-slate-500" />
              <span>Tap Start to calibrate focus</span>
            </div>
          )}
        </div>

        {/* Live helper instructions */}
        <div className="h-6 mt-6">
          <p
            className="text-sm font-medium tracking-tight text-slate-200 animate-fade-in text-center"
            aria-live="polite"
          >
            {isActive ? statePulse.label : "Choose a pattern above, sit straight, and open your chest."}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-center space-x-3">
        <button
          onClick={toggleSession}
          className={`px-6 py-2.5 rounded-xl font-medium text-sm flex items-center space-x-2 shadow-lg transition cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
            isActive
              ? "bg-amber-600 hover:bg-amber-500 text-amber-50 shadow-amber-950/20"
              : "bg-emerald-600 hover:bg-emerald-500 text-emerald-50 shadow-emerald-950/20"
          }`}
          aria-label={isActive ? "Pause breathing session" : "Start deep breathing session"}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 fill-slate-50" aria-hidden="true" />
              <span>Freeze Session</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-slate-50" aria-hidden="true" />
              <span>Begin Deep Breathing</span>
            </>
          )}
        </button>

        <button
          onClick={resetSession}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-slate-100 transition cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          title="Reset timer"
          aria-label="Reset breathing session cycle counter and timer"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Informational Guidance block */}
      <div className="mt-6 p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start space-x-3 text-xs leading-relaxed text-slate-400">
        <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <span className="font-semibold text-slate-300">Why this resets panic:</span> Slowing your breath sends immediate sensory triggers to your parasympathetic database to lower active cortisol, drop high heartbeat counts, and de-freeze study paralysis in under 90 seconds. Keep practicing during Mock-test intervals.
        </div>
      </div>
    </div>
  );
}
