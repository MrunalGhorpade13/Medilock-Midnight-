import React, { useState, useEffect } from 'react';
import { AppMode } from '@contract/types';
import { lockboxService } from './services/lockbox-service';
import { midnightWallet } from './services/wallet';
import { Navbar } from './components/Navbar';
import { PatientView } from './components/PatientView';
import { ResponderView } from './components/ResponderView';
import { DevDebugRoute } from './components/DevDebugRoute';
import { OnboardingModal } from './components/PatientCard/OnboardingModal';
import { ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode | 'DEV'>('PATIENT');
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    // Auto-show guide on very first visit
    if (!lockboxService.getShieldedMedicalPayload() && !localStorage.getItem('medilock_onboarded_v2')) {
      setOnboardingOpen(true);
      localStorage.setItem('medilock_onboarded_v2', 'true');
    }
  }, []);

  const handleModeChange = (mode: AppMode | 'DEV') => {
    setCurrentMode(mode);
    if (mode === 'RESPONDER') {
      midnightWallet.setWalletRole('RESPONDER_AUTHORIZED');
    } else if (mode === 'PATIENT') {
      midnightWallet.setWalletRole('PATIENT');
    }
    window.dispatchEvent(new Event('wallet-role-changed'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-healthcare-bg text-healthcare-text font-sans">

      {/* Navbar */}
      <Navbar
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onOpenOnboarding={() => setOnboardingOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">

        {currentMode === 'PATIENT' && (
          <PatientView onStateUpdated={() => {}} />
        )}

        {currentMode === 'RESPONDER' && (
          <ResponderView onAccessRequested={() => {}} />
        )}

        {currentMode === 'DEV' && (
          <DevDebugRoute onBackToApp={() => setCurrentMode('PATIENT')} />
        )}

      </main>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-healthcare-border bg-white py-5 mt-auto text-healthcare-subtext text-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-healthcare-accent" />
            <span className="font-semibold text-healthcare-text">MediLock &bull; Emergency Medical ID</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setOnboardingOpen(true)}
              className="hover:text-healthcare-accent transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => setCurrentMode('DEV')}
              className="hover:text-healthcare-accent transition-colors"
            >
              Developer /dev
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
