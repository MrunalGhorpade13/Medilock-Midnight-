import React, { useState } from 'react';
import { ShieldCheck, QrCode, Lock, ArrowRight, Check } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-healthcare-border rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-healthcare-lg">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-healthcare-border pb-4">
          <span className="text-xs font-mono font-bold text-healthcare-accent uppercase tracking-wider">
            Step {step} of 3
          </span>
          <div className="flex space-x-1.5">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === i ? 'w-6 bg-healthcare-accent' : 'w-2 bg-healthcare-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-healthcare-panel flex items-center justify-center mx-auto text-healthcare-accent">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-healthcare-text">1. Enter Your Emergency Info</h3>
            <p className="text-sm text-healthcare-subtext leading-relaxed">
              Fill in your blood type, severe allergies, medications, and emergency contact once. Your data is encrypted securely on your device.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-healthcare-panel flex items-center justify-center mx-auto text-healthcare-accent">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-healthcare-text">2. Get Your Digital ID &amp; QR</h3>
            <p className="text-sm text-healthcare-subtext leading-relaxed">
              Your personal Medical ID card generates instantly with a QR code. Save it, print it for your wallet, or save to your phone screen.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-healthcare-panel flex items-center justify-center mx-auto text-healthcare-accent">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-healthcare-text">3. Complete Lock &amp; Control</h3>
            <p className="text-sm text-healthcare-subtext leading-relaxed">
              Only verified paramedics can scan your card in an emergency. You can lock or deactivate your card anytime with a single toggle switch.
            </p>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-healthcare-subtext hover:text-healthcare-text"
          >
            Skip Intro
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 bg-healthcare-accent hover:bg-healthcare-accentHover text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-healthcare-accent hover:bg-healthcare-accentHover text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Get Started</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
