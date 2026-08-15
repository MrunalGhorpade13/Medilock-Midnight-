import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  QrCode,
  HelpCircle,
  Terminal,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';
import { AppMode } from '@contract/types';
import { midnightProvider, LaceWalletState } from '../services/midnight-provider';

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
  const [walletState, setWalletState] = useState<LaceWalletState>(midnightProvider.getWalletState());
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Restore persisted preference, default to light
    return localStorage.getItem('medilock_theme') === 'dark';
  });

  // Apply / remove dark class on <html> whenever isDark changes
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

  useEffect(() => {
    midnightProvider.connectLaceWallet().then(setWalletState);
  }, []);

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

            {/* Lace Wallet Pill */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-healthcare-panel dark:bg-gray-700 border border-healthcare-border dark:border-gray-600 text-xs font-mono text-healthcare-subtext dark:text-gray-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-healthcare-accent" />
              <span className="hidden md:inline font-sans text-healthcare-text dark:text-gray-200 font-medium text-[11px]">
                {walletState.isConnected ? 'Lace Wallet Connected' : 'Connect Lace Wallet'}
              </span>
            </div>

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
