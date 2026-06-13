import { useState } from "react";
import { MoodEntry } from "../types";
import { TrendingUp, Activity, HeartHandshake } from "lucide-react";

interface TrendsChartProps {
  moods: MoodEntry[];
}

export default function TrendsChart({ moods }: TrendsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // We need at least some data points
  if (moods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-dashed border-slate-800 rounded-2xl bg-slate-900/50 text-slate-400">
        <Activity className="w-8 h-8 mb-2 text-slate-600" aria-hidden="true" />
        <p className="text-sm font-sans">No emotional nodes logged yet.</p>
        <p className="text-xs text-slate-505 mt-1">Log a past mood note to populate the trend timeline.</p>
      </div>
    );
  }

  // Work with a chronological list (oldest to newest) for left-to-right drawing
  // Limit to last 7 days for readability
  const data = [...moods]
    .slice(0, 7)
    .reverse();

  const width = 500;
  const height = 200;
  const padding = 30;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // X coordinate calculation
  const getX = (index: number) => {
    if (data.length <= 1) return padding + chartWidth / 2;
    return padding + (index / (data.length - 1)) * chartWidth;
  };

  // Y coordinate calculation (Scores 1 to 10 are mapped to height)
  const getY = (score: number) => {
    const minScore = 1;
    const maxScore = 10;
    const range = maxScore - minScore;
    const scale = (score - minScore) / range;
    return padding + chartHeight - scale * chartHeight;
  };

  // Build SVG Path points
  const moodPoints = data.map((d, i) => `${getX(i).toFixed(1)},${getY(d.moodScore).toFixed(1)}`).join(" ");
  const stressPoints = data.map((d, i) => `${getX(i).toFixed(1)},${getY(d.stressScore).toFixed(1)}`).join(" ");

  // Formatting date nicely
  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // Summary statistics
  const avgMood = (data.reduce((acc, curr) => acc + curr.moodScore, 0) / data.length).toFixed(1);
  const avgStress = (data.reduce((acc, curr) => acc + curr.stressScore, 0) / data.length).toFixed(1);

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>Emotional Trends Timeline</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Dual log of Mind Balance (Mood) vs Pressure (Stress) over the last 7 entries</p>
        </div>
        
        {/* Legends / Stats */}
        <div className="flex items-center space-x-4 mt-3 md:mt-0">
          <div className="flex items-center space-x-2 bg-emerald-500/5 px-2.5 py-1 border border-emerald-500/10 rounded-lg text-xs">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" aria-hidden="true"></div>
            <span className="text-slate-300 font-sans">Avg Mood: <b className="text-emerald-400">{avgMood}</b></span>
          </div>
          <div className="flex items-center space-x-2 bg-rose-500/5 px-2.5 py-1 border border-rose-500/10 rounded-lg text-xs">
            <div className="w-2.5 h-2.5 bg-rose-400 rounded-full" aria-hidden="true"></div>
            <span className="text-slate-300 font-sans">Avg Stress: <b className="text-rose-400">{avgStress}</b></span>
          </div>
        </div>
      </div>

      {/* Screen Reader Only Detailed Description */}
      <div className="sr-only">
        Emotional Trends Chart displaying the last {data.length} registered entries.
        The current average Mood score is {avgMood} out of 10.
        The current average Stress score is {avgStress} out of 10.
        You can navigate the data points using Tab keys to hear individual record logs.
      </div>

      {/* Handcrafted Interactive SVG */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          role="img"
          aria-label="Student Resiliency Mood versus Stress chart line graph representation."
        >
          {/* Grid lines */}
          {[1, 5, 10].map((level) => (
            <g key={level}>
              <line
                x1={padding}
                y1={getY(level)}
                x2={width - padding}
                y2={getY(level)}
                className="stroke-slate-800/80 stroke-1"
                strokeDasharray="4,4"
                aria-hidden="true"
              />
              <text
                x={padding - 10}
                y={getY(level) + 4}
                className="fill-slate-500 text-[10px] font-mono text-right"
                textAnchor="end"
                aria-hidden="true"
              >
                {level === 10 ? "Peak" : level === 1 ? "Low" : "Mid"}
              </text>
            </g>
          ))}

          {/* Guidelines borders */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="stroke-slate-800" aria-hidden="true" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="stroke-slate-800" aria-hidden="true" />

          {/* Trend lines */}
          {data.length > 1 && (
            <>
              {/* Mood Line */}
              <polyline
                fill="none"
                stroke="url(#moodGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={moodPoints}
                className="drop-shadow-[0_2px_8px_rgba(16,185,129,0.2)]"
                aria-hidden="true"
              />
              {/* Stress Line */}
              <polyline
                fill="none"
                stroke="url(#stressGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={stressPoints}
                className="drop-shadow-[0_2px_8px_rgba(244,63,94,0.2)]"
                aria-hidden="true"
              />
            </>
          )}

          {/* Gradients declarations */}
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="stressGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
          </defs>

          {/* Interactive touch targets of nodes */}
          {data.map((d, i) => {
            const mx = getX(i);
            const myMood = getY(d.moodScore);
            const myStress = getY(d.stressScore);

            return (
              <g key={d.id} className="focus:outline-none">
                {/* Vertical hover line indicator */}
                {hoveredIndex === i && (
                  <line
                    x1={mx}
                    y1={padding}
                    x2={mx}
                    y2={height - padding}
                    className="stroke-slate-700 stroke-1"
                    strokeDasharray="2,2"
                    aria-hidden="true"
                  />
                )}

                {/* Mood point dot */}
                <circle
                  cx={mx}
                  cy={myMood}
                  r={hoveredIndex === i ? 6 : 4}
                  className="fill-emerald-400 stroke-slate-900 stroke-2 transition-all duration-150"
                  aria-hidden="true"
                />

                {/* Stress point dot */}
                <circle
                  cx={mx}
                  cy={myStress}
                  r={hoveredIndex === i ? 6 : 4}
                  className="fill-rose-400 stroke-slate-900 stroke-2 transition-all duration-150"
                  aria-hidden="true"
                />

                {/* X axis labels */}
                {i % Math.max(1, Math.floor(data.length / 4)) === 0 && (
                  <text
                    x={mx}
                    y={height - padding + 15}
                    className="fill-slate-400 text-[10px] font-sans text-center"
                    textAnchor="middle"
                    aria-hidden="true"
                  >
                    {formatDate(d.timestamp)}
                  </text>
                )}

                {/* Cover target to trigger hover anywhere near the slot column - Now keyboard accessible! */}
                <rect
                  x={mx - 15}
                  y={padding}
                  width={30}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer focus:outline-none focus:fill-slate-800/10"
                  tabIndex={0}
                  aria-label={`Record logged on ${formatDate(d.timestamp)}. Mood score: ${d.moodScore} out of 10. Stress score: ${d.stressScore} out of 10. Notes: ${d.optionalNote || "no notes logged"}`}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onFocus={() => setHoveredIndex(i)}
                  onBlur={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Dynamic Tooltip summary below the chart block to avoid collision */}
      <div className="h-16 mt-4 relative">
        {hoveredIndex !== null ? (
          <div className="absolute inset-0 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-start space-x-3 text-xs leading-tight animate-fade-in" aria-live="polite">
            <div className="flex flex-col border-r border-slate-800 pr-3 justify-center shrink-0">
              <span className="text-slate-400 font-mono text-[10px]">{formatDate(data[hoveredIndex].timestamp)}</span>
              <div className="flex items-center space-x-1.5 mt-1" aria-hidden="true">
                <span className="text-emerald-400 font-bold">M: {data[hoveredIndex].moodScore}</span>
                <span className="text-slate-600">|</span>
                <span className="text-rose-400 font-bold">S: {data[hoveredIndex].stressScore}</span>
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center space-x-1 flex-wrap gap-1 mb-1">
                {data[hoveredIndex].contextTags.map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 bg-slate-800 text-slate-350 text-[9px] rounded-md font-sans border border-slate-700/60">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-slate-200 truncate pr-3 text-[11px] italic font-sans">
                {data[hoveredIndex].optionalNote || "No study notes entered."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center inset-0 h-full border border-slate-800/40 rounded-xl bg-slate-950/10 text-slate-400 text-xs text-center px-4 leading-normal" aria-hidden="true">
            <HeartHandshake className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0 animate-pulse" />
            <span>Hover or Tab focus on any dot above to evaluate notes and emotional triggers instantly.</span>
          </div>
        )}
      </div>
    </div>
  );
}
