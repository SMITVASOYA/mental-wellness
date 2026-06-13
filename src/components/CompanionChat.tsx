import React, { useState, useRef, useEffect } from "react";
import { MessageSquareQuote } from "lucide-react";
import { ChatMessage } from "../types";

const ICE_BREAKERS = [
  "I scored poorly on today's chemistry mocks. How do I stop panicking?",
  "I have a massive study backlog and I'm freezing up with stress.",
  "I feel extremely guilty for taking a short workout break.",
  "Rohan is pacing way faster in maths revision. How do I stop comparing?",
];

interface CompanionChatProps {
  chats: ChatMessage[];
  onSendChat: (text: string) => Promise<void>;
  onClearChats: () => Promise<void>;
  isSending: boolean;
  profileName: string;
  profileExam: string;
}

export default function CompanionChat({
  chats,
  onSendChat,
  onClearChats,
  isSending,
  profileName,
  profileExam,
}: CompanionChatProps) {
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync scroll to chat bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const handleSend = async () => {
    const textSnapshot = chatInput.trim();
    if (!textSnapshot || isSending) return;
    setChatInput("");
    await onSendChat(textSnapshot);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div
      id="companion-chat-card"
      className="max-w-3xl mx-auto flex flex-col h-[650px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
      role="log"
      aria-label="Student Companion Chat Room"
    >
      {/* Header Title block */}
      <div className="px-5 py-4 bg-slate-950/30 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0"
            aria-hidden="true"
          >
            S
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center space-x-1.5">
              <span>Sarthi Guidance Coach</span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" aria-hidden="true"></span>
            </h3>
            <p className="text-[11px] text-slate-400">Validate study blockages and learn to schedule downtime</p>
          </div>
        </div>

        <button
          id="clear-chats-button"
          onClick={onClearChats}
          className="text-[10px] text-slate-400 hover:text-slate-305 font-mono cursor-pointer underline hover:no-underline focus:outline-none focus:ring-1 focus:ring-indigo-500 px-1 rounded"
          aria-label="Reset peer support chat history records"
        >
          Reset guidance records
        </button>
      </div>

      {/* Message scroll container */}
      <div
        className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin select-text"
        aria-live="polite"
        aria-relevant="additions"
      >
        {chats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <MessageSquareQuote className="w-8 h-8 text-indigo-400/80" aria-hidden="true" />
            <div className="max-w-sm">
              <h4 className="text-sm font-semibold text-slate-200">Empathic companion ready</h4>
              <p className="text-xs text-slate-400 leading-normal mt-1">
                Sarthi is ready to support your {profileExam} mental journey. Select a preset query below to trigger an immediate counsel:
              </p>
            </div>

            {/* Preconfigured rapid Icebreakers queries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mt-2 text-left" role="group" aria-label="Icebreaker suggestions">
              {ICE_BREAKERS.map((q) => (
                <button
                  key={q}
                  onClick={() => onSendChat(q)}
                  className="p-3 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 leading-tight transition hover:text-indigo-300 hover:border-indigo-500/40 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label={`Ask Sarthi: ${q}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed font-sans ${
                    msg.sender === "student"
                      ? "bg-indigo-600 text-slate-100 shadow-md shadow-indigo-950/20"
                      : "bg-slate-950/80 text-slate-200 border border-slate-800/80"
                  }`}
                  aria-label={msg.sender === "student" ? `My message sent at ${new Date(msg.timestamp).toLocaleTimeString()}` : `Sarthi message received at ${new Date(msg.timestamp).toLocaleTimeString()}`}
                >
                  <div className="font-semibold text-[10px] text-slate-400 font-mono mb-0.5" aria-hidden="true">
                    {msg.sender === "student" ? "Me (Aspirant)" : "Sarthi Coach"}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block text-right" aria-hidden="true">
                    {new Date(msg.timestamp).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* Pending state */}
            {isSending && (
              <div className="flex justify-start">
                <div
                  className="bg-slate-950/80 border border-slate-800/80 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center space-x-2 font-sans font-mono italic"
                  aria-label="Sarthi is typing..."
                >
                  <div className="flex space-x-1" aria-hidden="true">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span>Sarthi companion formulating supportive thoughts...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Chat Send interface bar */}
      <div className="p-4 bg-slate-950/40 border-t border-slate-800 flex items-center space-x-3">
        <input
          id="chat-message-input"
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell Sarthi coach what holds you back right now..."
          className="flex-1 bg-slate-950 text-xs text-slate-200 rounded-xl px-4 py-3 border border-slate-800 focus:outline-none focus:border-indigo-500/80 placeholder-slate-600 font-sans focus:ring-2 focus:ring-indigo-500"
          aria-label="Type your message to Sarthi guidance coach"
        />
        <button
          id="send-chat-button"
          onClick={handleSend}
          disabled={!chatInput.trim() || isSending}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 hover:border-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Send message to Sarthi guidance coach"
        >
          Send
        </button>
      </div>
    </div>
  );
}
