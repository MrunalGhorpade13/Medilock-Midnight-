import React, { useState, useEffect } from 'react';
import { LedgerInspector } from './LedgerInspector';
import { lockboxService } from '../services/lockbox-service';
import { midnightWallet } from '../services/wallet';
import { PublicLedgerState, AccessLogEntry, ResponderKeyInfo } from '@contract/types';
import { Terminal, Shield, Lock, UserCheck, Key, History, ArrowLeft } from 'lucide-react';

interface DevDebugRouteProps {
  onBackToApp: () => void;
}

export const DevDebugRoute: React.FC<DevDebugRouteProps> = ({ onBackToApp }) => {
  const [ledgerState, setLedgerState] = useState<PublicLedgerState>(lockboxService.getPublicLedgerState());
  const [accessLogs, setAccessLogs] = useState<AccessLogEntry[]>(lockboxService.getAccessLogs());
  const [activeWalletRole, setActiveWalletRole] = useState(midnightWallet.getWalletRole());
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const refreshState = () => {
    setLedgerState(lockboxService.getPublicLedgerState());
    setAccessLogs(lockboxService.getAccessLogs());
    setActiveWalletRole(midnightWallet.getWalletRole());
  };

  useEffect(() => {
    refreshState();
    const handleWalletChange = () => refreshState();
    window.addEventListener('wallet-role-changed', handleWalletChange);
    return () => window.removeEventListener('wallet-role-changed', handleWalletChange);
  }, []);

  const handleSwitchRole = (role: any) => {
    midnightWallet.setWalletRole(role);
    window.dispatchEvent(new Event('wallet-role-changed'));
    refreshState();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 font-mono text-xs text-slate-100 bg-midnight-950 rounded-3xl border border-white/10 my-6 shadow-2xl">
      
      {/* Dev Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToApp}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-shield-cyan" />
            <h2 className="text-base font-bold text-white">Developer Debugging Suite (/dev)</h2>
          </div>
        </div>

        <button
          onClick={() => setInspectorOpen(true)}
          className="px-3.5 py-1.5 bg-shield-cyan/20 text-shield-cyan border border-shield-cyan/40 rounded-xl hover:bg-shield-cyan/30 transition-colors flex items-center space-x-1.5 font-bold"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Open Ledger Inspector</span>
        </button>
      </div>

      {/* Role Switcher */}
      <div className="p-4 rounded-2xl bg-midnight-900 border border-white/10 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-shield-teal" />
          <span>Wallet Role Testing Selector</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => handleSwitchRole('PATIENT')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeWalletRole === 'PATIENT'
                ? 'bg-shield-cyan/20 border-shield-cyan text-white font-bold'
                : 'bg-midnight-950 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <p className="text-xs">Patient Persona</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Owner of lockbox</p>
          </button>

          <button
            onClick={() => handleSwitchRole('RESPONDER_AUTHORIZED')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeWalletRole === 'RESPONDER_AUTHORIZED'
                ? 'bg-shield-emerald/20 border-shield-emerald text-white font-bold'
                : 'bg-midnight-950 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <p className="text-xs">Authorized Hospital</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Key in authorizedKeys set</p>
          </button>

          <button
            onClick={() => handleSwitchRole('RESPONDER_UNAUTHORIZED')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeWalletRole === 'RESPONDER_UNAUTHORIZED'
                ? 'bg-shield-rose/20 border-shield-rose text-white font-bold'
                : 'bg-midnight-950 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <p className="text-xs">Unauthorized EMS Squad</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Unregistered key</p>
          </button>
        </div>
      </div>

      {/* Raw Ledger Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-midnight-900 border border-white/10 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase">Ledger State</p>
          <p className="text-base font-bold text-shield-cyan">{ledgerState.state}</p>
        </div>

        <div className="p-4 rounded-2xl bg-midnight-900 border border-white/10 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase">Access Count</p>
          <p className="text-base font-bold text-shield-teal">{ledgerState.accessCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-midnight-900 border border-white/10 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase">Round Nonce</p>
          <p className="text-base font-bold text-shield-purple">{ledgerState.round}</p>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="p-4 rounded-2xl bg-midnight-900 border border-white/10 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase flex items-center space-x-2">
          <History className="w-4 h-4 text-shield-purple" />
          <span>Raw ZK Proof Audit Trail</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase">
                <th className="py-2 px-2">Scan #</th>
                <th className="py-2 px-2">Time</th>
                <th className="py-2 px-2">ZK Status</th>
                <th className="py-2 px-2">Anonymous Proof Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {accessLogs.map(log => (
                <tr key={log.id}>
                  <td className="py-2 px-2 font-bold text-white">#{log.accessCountNumber}</td>
                  <td className="py-2 px-2 text-slate-300">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.verifiedZkProof ? 'bg-shield-emerald/20 text-shield-emerald' : 'bg-shield-rose/20 text-shield-rose'
                    }`}>
                      {log.verifiedZkProof ? 'VERIFIED ZK' : 'REJECTED'}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-shield-cyan">{log.anonymousResponderHash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LedgerInspector
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
      />

    </div>
  );
};
