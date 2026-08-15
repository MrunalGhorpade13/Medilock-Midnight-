import React, { useState } from 'react';
import {
  Terminal,
  X,
  Lock,
  EyeOff,
  Key,
  History,
  Code,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { lockboxService } from '../services/lockbox-service';

interface LedgerInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LedgerInspector: React.FC<LedgerInspectorProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const ledgerState = lockboxService.getPublicLedgerState();
  const shieldedPayload = lockboxService.getShieldedMedicalPayload();
  const responders = lockboxService.getAuthorizedResponders();
  const logs = lockboxService.getAccessLogs();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-midnight-900 border border-shield-cyan/50 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-midnight-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-shield-cyan/20 border border-shield-cyan/40 text-shield-cyan">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center space-x-2">
                <span>Midnight Contract Ledger Inspector</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Real-time breakdown of Public On-Chain Ledger vs Shielded Local Wallet State
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-midnight-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 font-mono text-xs">
          
          {/* Section 1: Public Ledger State */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-shield-cyan">
              <h3 className="font-bold flex items-center space-x-2 uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>1. Public Ledger State (On-Chain / Visible to All Network Nodes)</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] bg-shield-cyan/20 border border-shield-cyan/30">
                Network: Midnight Testnet
              </span>
            </div>

            <div className="bg-midnight-950 p-4 rounded-2xl border border-midnight-800 space-y-2 text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex justify-between items-center bg-midnight-900/60 p-2.5 rounded-xl border border-midnight-800">
                  <span className="text-slate-400">Contract Address:</span>
                  <span className="text-white truncate max-w-[180px]">{lockboxService.getContractAddress()}</span>
                </div>

                <div className="flex justify-between items-center bg-midnight-900/60 p-2.5 rounded-xl border border-midnight-800">
                  <span className="text-slate-400">Record State:</span>
                  <span className={`font-bold ${
                    ledgerState.state === 'ACTIVE' ? 'text-shield-emerald' : 'text-shield-rose'
                  }`}>
                    {ledgerState.state}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-midnight-900/60 p-2.5 rounded-xl border border-midnight-800">
                  <span className="text-slate-400">Owner Identity Hash:</span>
                  <span className="text-shield-cyan font-bold">{ledgerState.ownerCommitment ? `${ledgerState.ownerCommitment.slice(0, 14)}...` : 'EMPTY'}</span>
                </div>

                <div className="flex justify-between items-center bg-midnight-900/60 p-2.5 rounded-xl border border-midnight-800">
                  <span className="text-slate-400">Payload Commitment:</span>
                  <span className="text-shield-teal font-bold">{ledgerState.recordCommitment ? `${ledgerState.recordCommitment.slice(0, 14)}...` : 'EMPTY'}</span>
                </div>

                <div className="flex justify-between items-center bg-midnight-900/60 p-2.5 rounded-xl border border-midnight-800">
                  <span className="text-slate-400">Public Access Counter:</span>
                  <span className="text-white font-bold">{ledgerState.accessCount} emergency scans</span>
                </div>

                <div className="flex justify-between items-center bg-midnight-900/60 p-2.5 rounded-xl border border-midnight-800">
                  <span className="text-slate-400">Anti-Linkability Round:</span>
                  <span className="text-white font-bold">Nonce #{ledgerState.round}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Shielded Local Storage vs Ledger Comparison */}
          <div className="space-y-3">
            <h3 className="font-bold text-shield-emerald flex items-center space-x-2 uppercase tracking-wider">
              <EyeOff className="w-4 h-4" />
              <span>2. Shielded Local State vs Public Ledger Comparison</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Private Witness Data */}
              <div className="bg-midnight-950 p-4 rounded-2xl border border-shield-emerald/30 space-y-2">
                <div className="flex items-center justify-between text-shield-emerald font-bold border-b border-midnight-800 pb-2">
                  <span>Local Private Storage (User Wallet)</span>
                  <EyeOff className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  The actual medical payload is stored client-side in local encrypted DB.
                </p>
                <pre className="text-[11px] text-shield-emerald overflow-x-auto p-2 rounded bg-midnight-900/80 border border-midnight-800">
                  {JSON.stringify(shieldedPayload, null, 2)}
                </pre>
              </div>

              {/* Public Ledger Commitment */}
              <div className="bg-midnight-950 p-4 rounded-2xl border border-shield-cyan/30 space-y-2">
                <div className="flex items-center justify-between text-shield-cyan font-bold border-b border-midnight-800 pb-2">
                  <span>Public Ledger Storage (Blockchain)</span>
                  <Lock className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  The blockchain ledger ONLY stores a 32-byte Zero-Knowledge commitment hash.
                </p>
                <div className="p-3 rounded bg-midnight-900/80 border border-midnight-800 text-[11px] text-shield-cyan space-y-1">
                  <p>recordCommitment:</p>
                  <p className="text-white break-all font-mono font-bold">{ledgerState.recordCommitment || 'N/A'}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Authorized Responders Cryptographic Key Set */}
          <div className="space-y-3">
            <h3 className="font-bold text-shield-purple flex items-center space-x-2 uppercase tracking-wider">
              <Key className="w-4 h-4" />
              <span>3. authorizedKeys Set&lt;Bytes&lt;32&gt;&gt; (ZK Membership Set)</span>
            </h3>

            <div className="bg-midnight-950 p-4 rounded-2xl border border-midnight-800 space-y-2">
              <p className="text-[11px] text-slate-400 font-sans">
                Each responder's public key is stored as a persistentHash commitment, so public nodes cannot learn responder identity.
              </p>

              <div className="space-y-2">
                {ledgerState.authorizedKeyHashes.map((hash, i) => (
                  <div key={i} className="flex items-center justify-between bg-midnight-900 p-2.5 rounded-xl border border-midnight-800">
                    <span className="text-shield-purple font-bold">Key #{i + 1}: {hash}</span>
                    <button
                      onClick={() => handleCopy(hash, `hash-${i}`)}
                      className="p-1 rounded bg-midnight-800 text-slate-300 hover:text-white"
                    >
                      {copiedKey === `hash-${i}` ? <Check className="w-3.5 h-3.5 text-shield-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-midnight-800 bg-midnight-950/60 rounded-b-3xl flex justify-between items-center text-xs font-mono text-slate-400">
          <span>Emergency Medical Lockbox &bull; Midnight Compact SDK v0.16</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-midnight-800 hover:bg-midnight-700 text-white rounded-xl font-bold transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
