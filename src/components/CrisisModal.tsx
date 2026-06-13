import { ShieldAlert, Phone, HelpCircle, UserCheck, Heart, AlertOctagon, X } from "lucide-react";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  if (!isOpen) return null;

  return (
    <div id="crisis-modal-overlay" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border-2 border-rose-500/80 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl shadow-rose-500/10">
        
        {/* Urgent Alert Banner */}
        <div className="bg-gradient-to-r from-rose-600 to-amber-600 px-6 py-4 flex items-center justify-between text-slate-100">
          <div className="flex items-center space-x-3">
            <AlertOctagon className="w-5 h-5 text-white fill-rose-600 animate-bounce" />
            <span className="font-semibold text-sm tracking-wide font-sans uppercase">Sarthi Emergency Support Network</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content details */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 font-sans tracking-tight">Your life and peace are infinitely precious.</h3>
            <p className="text-xs text-slate-300 leading-normal mt-2 select-text max-w-sm mx-auto">
              No examination rank, percentile, seat backlog, or score drop is ever worth your mental pain. Exams can be retaken, but you cannot be replaced. We are here to support you.
            </p>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">Verified Toll-Free National Helplines</p>
          
          <div className="space-y-3">
            {/* Helpline 1: Tele-MANAS */}
            <div className="p-3.5 bg-slate-950/50 hover:bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between select-text group transition">
              <div className="flex space-x-3">
                <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-lg shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Tele-MANAS (Govt of India Helpline)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                    24x7 Free counselling, support, panic calming, and psychological trauma containment.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-emerald-400 font-mono font-bold text-xs group-hover:underline">14416</span>
                <span className="text-[9px] text-slate-500 font-mono block">1800 891 4416</span>
              </div>
            </div>

            {/* Helpline 2: AASRA */}
            <div className="p-3.5 bg-slate-950/50 hover:bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between select-text group transition">
              <div className="flex space-x-3">
                <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-lg shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">AASRA Foundation Support</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                    Empathic active listening and immediate suicide prevention counseling.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-indigo-400 font-mono font-bold text-xs group-hover:underline">+91 9820466726</span>
                <span className="text-[9px] text-slate-500 font-sans block">Paid - 24/7 Support</span>
              </div>
            </div>

            {/* Helpline 3: Vandrevala */}
            <div className="p-3.5 bg-slate-950/50 hover:bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between select-text group transition">
              <div className="flex space-x-3">
                <div className="p-2 bg-rose-500/15 text-rose-400 rounded-lg shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Vandrevala Mental Health Foundation</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                    Dedicated certified psychiatrist and therapy counselor support.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-rose-400 font-mono font-bold text-xs group-hover:underline">+91 9999666555</span>
                <span className="text-[9px] text-slate-500 font-sans block">Free - 24/7 Support</span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start space-x-3 text-xs text-rose-300 leading-normal">
            <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-rose-200">A quick reminder to yourself:</span> Step away from the book. Drink a slow glass of room-temperature water. Lie down flat, turn off your devices, and allow yourself to rest. Rank statistics hold zero meaning compared to your beautiful existence.
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[10px] text-slate-500 flex items-center space-x-1">
            <UserCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Close tabs and rest today</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-medium text-xs border border-slate-700 transition"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
}
