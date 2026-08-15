import React from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  QrCode,
  Sparkles,
  X,
  UserCheck,
  Stethoscope,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-midnight-900 border border-shield-cyan/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-shield-cyan/20 text-shield-cyan border border-shield-cyan/30 uppercase tracking-wider">
            SIMPLE USER GUIDE
          </span>
          <h2 className="text-xl font-extrabold text-white">How Emergency Medical Lockbox Works</h2>
          <p className="text-xs text-slate-300">
            A privacy-first medical ID system powered by Midnight blockchain zero-knowledge proofs.
          </p>
        </div>

        {/* 4 Simple Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          {/* Step 1 */}
          <div className="bg-midnight-950 p-4.5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center space-x-2 text-shield-cyan font-bold">
              <div className="w-6 h-6 rounded-lg bg-shield-cyan/20 flex items-center justify-center text-xs font-mono">1</div>
              <span>Shield Your Data</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              You enter your critical medical info (blood type, allergies, emergency contact). Your data is <strong>encrypted locally</strong> in your wallet — never published on a public blockchain!
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-midnight-950 p-4.5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center space-x-2 text-shield-teal font-bold">
              <div className="w-6 h-6 rounded-lg bg-shield-teal/20 flex items-center justify-center text-xs font-mono">2</div>
              <span>Authorize Responders</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              You pre-authorize trusted hospital or paramedic keys. Only keys on your authorized list can request access during an emergency.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-midnight-950 p-4.5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center space-x-2 text-shield-purple font-bold">
              <div className="w-6 h-6 rounded-lg bg-shield-purple/20 flex items-center justify-center text-xs font-mono">3</div>
              <span>Scan Emergency QR</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Keep your Emergency QR code on your phone lock screen or medical ID card. Paramedics scan it in an emergency to initiate access.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-midnight-950 p-4.5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center space-x-2 text-shield-emerald font-bold">
              <div className="w-6 h-6 rounded-lg bg-shield-emerald/20 flex items-center justify-center text-xs font-mono">4</div>
              <span>Zero-Knowledge Proof</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Midnight verifies the paramedic's authorization using a <strong>Zero-Knowledge proof</strong> (without revealing who accessed it publicly). Once verified, your emergency card unlocks!
            </p>
          </div>

        </div>

        {/* Interactive Quick Demo Tip */}
        <div className="glass-card-glow p-4.5 rounded-2xl space-y-2 border border-shield-cyan/30">
          <div className="flex items-center space-x-2 text-shield-cyan font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>How to try the demo in 30 seconds:</span>
          </div>
          <ol className="text-xs text-slate-200 space-y-1.5 list-decimal list-inside font-sans">
            <li>Stay in <strong>Patient Mode</strong> to see your Emergency QR &amp; Medical Card.</li>
            <li>Click <strong>Paramedic Portal</strong> in top bar to simulate scanning.</li>
            <li>Click <strong>Request Access &amp; Verify ZK Proof</strong> to watch your medical card decrypt!</li>
          </ol>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-shield-cyan text-midnight-950 font-bold rounded-xl text-xs hover:opacity-90 transition-opacity"
        >
          Got it! Close Guide
        </button>

      </div>
    </div>
  );
};
