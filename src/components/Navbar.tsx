import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  QrCode,
  HelpCircle,
  Terminal,
  CheckCircle2,
  Sun,
  Moon,
  Wallet,
  ChevronDown,
} from 'lucide-react';
import { AppMode } from '@contract/types';
import { midnightProvider, MidnightWalletState } from '../services/midnight-provider';

interface NavbarProps {
  currentMode: AppMode | 'DEV';
  onModeChange: (mode: AppMode | 'DEV') => void;
  onOpenOnboarding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onModeChange,
  onOpenOnboarding,
}) => {
  const [walletState, setWalletState] = useState<MidnightWalletState>({ isConnected: false });
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('medilock_theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('medilock_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('medilock_theme', 'light');
    }
  }, [isDark]);

  // Detect which Midnight wallets are available in this browser
  useEffect(() => {
    const detectWallets = () => {
      const mgr = (window as any).midnight;
      if (mgr && typeof mgr === 'object') {
        setAvailableWallets(Object.keys(mgr));
        console.log('[Navbar] Available wallet keys:', Object.keys(mgr));
      } else {
        setAvailableWallets([]);
      }
    };
    // Check immediately and again after a short delay (some wallets inject late)
    detectWallets();
    const timer = setTimeout(detectWallets, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#wallet-menu-container')) {
        setShowWalletMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const connectWith1AM = async () => {
    setShowWalletMenu(false);
    setWalletError(null);
    setIsConnecting('1am');
    try {
      const state = await midnightProvider.connect1AMWallet();
      setWalletState(state);
      if (state.error) setWalletError(state.error);
    } catch (e: any) {
      setWalletError(e?.message || '1AM Wallet connection failed');
    } finally {
      setIsConnecting(null);
    }
  };

  const connectWithLace = async () => {
    setShowWalletMenu(false);
    setWalletError(null);
    setIsConnecting('lace');
    try {
      const state = await midnightProvider.connectLaceWallet();
      setWalletState(state);
      if (state.error) setWalletError(state.error);
    } catch (e: any) {
      setWalletError(e?.message || 'Lace Wallet connection failed');
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnectWallet = () => {
    const state = midnightProvider.disconnectWallet();
    setWalletState(state);
  };

  const connectingLabel = isConnecting === '1am'
    ? 'Connecting 1AM...'
    : isConnecting === 'lace'
    ? 'Connecting Lace...'
    : null;

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-healthcare-border dark:border-gray-700 shadow-healthcare transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Brand Logo */}
          <div
            onClick={() => onModeChange('PATIENT')}
            className="flex items-center space-x-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-healthcare-accent flex items-center justify-center text-white shadow-healthcare">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-healthcare-text dark:text-gray-100">
                MediLock
              </h1>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-healthcare-panel dark:bg-gray-700 border border-healthcare-border dark:border-gray-600 rounded-2xl">
            <button
              onClick={() => onModeChange('PATIENT')}
              className={`flex items-center space-x-2 px-4 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                currentMode === 'PATIENT'
                  ? 'bg-healthcare-accent text-white shadow-healthcare'
                  : 'text-healthcare-subtext dark:text-gray-400 hover:text-healthcare-text dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>My Medical ID</span>
            </button>

            <button
              onClick={() => onModeChange('RESPONDER')}
              className={`flex items-center space-x-2 px-4 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                currentMode === 'RESPONDER'
                  ? 'bg-healthcare-accent text-white shadow-healthcare'
                  : 'text-healthcare-subtext dark:text-gray-400 hover:text-healthcare-text dark:hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Scan Medical ID</span>
            </button>
          </div>

          {/* Right Header Tools */}
          <div className="flex items-center space-x-2">

            {/* Guide Button */}
            <button
              onClick={onOpenOnboarding}
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-xl bg-healthcare-panel dark:bg-gray-700 border border-healthcare-border dark:border-gray-600 text-healthcare-text dark:text-gray-200 hover:bg-healthcare-panelDark dark:hover:bg-gray-600 transition-colors flex items-center space-x-1.5"
              title="How It Works"
            >
              <HelpCircle className="w-4 h-4 text-healthcare-accent" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            {/* 🌙 Dark / ☀️ Light Toggle */}
            <button
              onClick={() => setIsDark(prev => !prev)}
              className="p-2 rounded-xl bg-healthcare-panel dark:bg-gray-700 border border-healthcare-border dark:border-gray-600 text-healthcare-text dark:text-gray-200 hover:bg-healthcare-panelDark dark:hover:bg-gray-600 transition-all duration-200"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 text-healthcare-subtext" />
              )}
            </button>

            {/* Wallet Error Toast */}
            {walletError && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-xs text-red-700 dark:text-red-300 max-w-xs">
                <span className="text-[11px] font-mono truncate" title={walletError}>⚠ {walletError}</span>
                <button onClick={() => setWalletError(null)} className="text-[10px] ml-1 text-red-400 hover:text-red-600 font-bold flex-shrink-0">✕</button>
              </div>
            )}

            {/* Wallet Section */}
            {walletState.isConnected ? (
              /* Connected State */
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-[11px]">{walletState.walletName || 'Wallet'} Connected</span>
                <button
                  onClick={handleDisconnectWallet}
                  className="ml-1 text-[10px] text-gray-400 hover:text-red-500 font-mono transition-colors"
                  title="Disconnect Wallet"
                >
                  ✕
                </button>
              </div>
            ) : (
              /* Wallet Connect Dropdown */
              <div id="wallet-menu-container" className="relative">
                {/* Main Connect Button / Loading */}
                {isConnecting ? (
                  <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 border border-purple-200 text-purple-700 text-xs font-medium">
                    <div className="w-3.5 h-3.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span>{connectingLabel}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowWalletMenu(prev => !prev)}
                    className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs shadow-healthcare transition-all duration-200 active:scale-95"
                    id="wallet-connect-btn"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Connect Wallet</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showWalletMenu ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {/* Dropdown Menu */}
                {showWalletMenu && !isConnecting && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="p-2 space-y-1">
                      <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 px-2 pt-1 pb-0.5 tracking-wider">
                        Choose Wallet
                      </p>

                      {/* No wallet detected warning */}
                      {availableWallets.length === 0 && (
                        <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl mx-1 mb-1">
                          <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">⚠️ No wallet detected</p>
                          <p className="text-[9px] text-amber-600 dark:text-amber-500 mt-0.5">Install 1AM or Lace wallet extension, then reload.</p>
                          <button
                            onClick={() => window.location.reload()}
                            className="mt-1.5 text-[10px] text-purple-600 font-bold underline"
                          >↺ Reload page</button>
                        </div>
                      )}

                      {/* Show detected wallet keys for debugging */}
                      {availableWallets.length > 0 && (
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400 px-2 pb-0.5 font-mono">
                          ✓ Found: {availableWallets.join(', ')}
                        </p>
                      )}

                      {/* 1AM Wallet Option */}
                      <button
                        onClick={connectWith1AM}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                          <Wallet className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-100">1AM Wallet</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">Midnight native</p>
                        </div>
                      </button>

                      {/* Lace Wallet Option */}
                      <button
                        onClick={connectWithLace}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-100">Lace Wallet</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">IOG / Cardano</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dev Debug Link */}
            <button
              onClick={() => onModeChange('DEV')}
              className="p-2 text-healthcare-subtext dark:text-gray-500 hover:text-healthcare-text dark:hover:text-gray-200 transition-colors rounded-xl hover:bg-healthcare-panel dark:hover:bg-gray-700"
              title="Developer Debug (/dev)"
            >
              <Terminal className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
