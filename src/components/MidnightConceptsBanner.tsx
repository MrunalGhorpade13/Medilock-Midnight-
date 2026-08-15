import React, { useState } from 'react';
import { Shield, EyeOff, Key, Cpu, X } from 'lucide-react';

export const MidnightConceptsBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  if (dismissed) return null;

  return (
    <div className="bg-midnight-900/60 border-b border-white/5 py-2 px-4 text-xs font-mono text-slate-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-shield-cyan/20 text-shield-cyan border border-shield-cyan/30">
            MIDNIGHT ZK ARCHITECTURE
          </span>
          <span className="hidden sm:inline text-slate-400">
            Medical payload is shielded; access control is enforced via ZK circuits.
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSelectedConcept('shielded')}
            className="text-slate-300 hover:text-shield-cyan transition-colors flex items-center space-x-1"
          >
            <EyeOff className="w-3 h-3 text-shield-cyan" />
            <span className="underline decoration-shield-cyan/40">Shielded State</span>
          </button>

          <button
            onClick={() => setSelectedConcept('circuit')}
            className="text-slate-300 hover:text-shield-teal transition-colors flex items-center space-x-1"
          >
            <Cpu className="w-3 h-3 text-shield-teal" />
            <span className="underline decoration-shield-teal/40">Compact Circuits</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="text-slate-500 hover:text-slate-300 p-0.5 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {selectedConcept && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-midnight-900 border border-shield-cyan/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedConcept(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedConcept === 'shielded' && (
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <EyeOff className="w-6 h-6 text-shield-cyan" />
                  <h3 className="text-base font-bold text-white">Shielded (Private) On-Chain State</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Midnight stores the medical payload off-chain in local wallet storage. The public ledger only stores a 32-byte ZK commitment (<code className="text-shield-cyan">persistentCommit</code>).
                </p>
              </div>
            )}

            {selectedConcept === 'circuit' && (
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <Cpu className="w-6 h-6 text-shield-teal" />
                  <h3 className="text-base font-bold text-white">Compact ZK Set Membership</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  The <code className="text-shield-teal">requestAccess()</code> circuit asserts <code className="text-shield-teal">authorizedKeys.member(pk)</code> in Zero-Knowledge. It proves responder authority without leaking responder identity on public explorers.
                </p>
              </div>
            )}

            <button
              onClick={() => setSelectedConcept(null)}
              className="mt-4 w-full py-2 bg-midnight-800 hover:bg-midnight-700 text-xs font-semibold text-white rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
