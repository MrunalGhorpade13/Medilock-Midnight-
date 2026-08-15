import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MedicalPayload } from '@contract/types';
import {
  Printer,
  Eye,
  Lock,
  Unlock,
  AlertTriangle,
  PhoneCall,
  Edit3,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

interface MedicalIdCardProps {
  payload: MedicalPayload;
  qrPayloadString: string;
  isRecordActive: boolean;
  onToggleActiveState: () => Promise<void>;
  onEdit: () => void;
  onPreviewResponderView: () => void;
}

export const MedicalIdCard: React.FC<MedicalIdCardProps> = ({
  payload,
  qrPayloadString,
  isRecordActive,
  onToggleActiveState,
  onEdit,
  onPreviewResponderView,
}) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggleActiveState();
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Status & Controls Header */}
      <div className="healthcare-card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Card Active / Locked Toggle Switch */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isRecordActive ? 'bg-healthcare-accent' : 'bg-healthcare-critical'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                isRecordActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            >
              {isToggling ? (
                <RefreshCw className="w-3 h-3 text-healthcare-subtext animate-spin" />
              ) : isRecordActive ? (
                <Unlock className="w-3 h-3 text-healthcare-accent" />
              ) : (
                <Lock className="w-3 h-3 text-healthcare-critical" />
              )}
            </span>
          </button>

          <div>
            <span className="text-xs font-bold text-healthcare-text block">
              {isRecordActive ? 'Card Active' : 'Card Locked'}
            </span>
            <span className="text-[11px] text-healthcare-subtext">
              {isRecordActive ? 'Emergency responders can scan' : 'Scans will be rejected'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onPreviewResponderView}
            className="px-3.5 py-2 bg-healthcare-panel hover:bg-healthcare-panelDark text-healthcare-text rounded-xl text-xs font-semibold flex items-center space-x-1.5 border border-healthcare-border transition-colors"
          >
            <Eye className="w-4 h-4 text-healthcare-accent" />
            <span>Test Scan Preview</span>
          </button>

          <button
            onClick={onEdit}
            className="px-3.5 py-2 bg-healthcare-panel hover:bg-healthcare-panelDark text-healthcare-text rounded-xl text-xs font-semibold flex items-center space-x-1.5 border border-healthcare-border transition-colors"
          >
            <Edit3 className="w-4 h-4 text-healthcare-accent" />
            <span>Edit Info</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-healthcare-accent hover:bg-healthcare-accentHover text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-healthcare transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print ID Card</span>
          </button>
        </div>

      </div>

      {/* Main Physical-Style Medical ID Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Scannable QR Code */}
        <div className="lg:col-span-5 healthcare-card p-6 flex flex-col items-center justify-center text-center space-y-4">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-healthcare-panel text-healthcare-accent uppercase tracking-wider">
            DIGITAL EMERGENCY MEDICAL ID
          </span>

          <div className="p-4 rounded-2xl bg-white border-2 border-healthcare-accent/30 shadow-healthcare">
            <QRCodeSVG
              value={qrPayloadString}
              size={190}
              level="H"
              includeMargin={false}
            />
          </div>

          <p className="text-xs text-healthcare-subtext max-w-xs">
            Present this QR code to paramedics or emergency medical staff in an emergency.
          </p>
        </div>

        {/* Right Side: Essential Vitals Card Layout */}
        <div className="lg:col-span-7 healthcare-card p-6 sm:p-7 space-y-5">
          
          <div className="flex items-start justify-between border-b border-healthcare-border pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-healthcare-subtext tracking-wider">
                PATIENT RECORD
              </span>
              <h2 className="text-2xl font-extrabold text-healthcare-text mt-0.5">
                {payload.fullName}
              </h2>
              <p className="text-xs text-healthcare-subtext mt-0.5">
                DOB: {payload.dateOfBirth} &bull; Organ Donor: <span className="font-semibold text-healthcare-accent">{payload.organDonor ? 'YES' : 'NO'}</span>
              </p>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-healthcare-warnBg border border-healthcare-warn text-healthcare-text font-mono text-center">
              <p className="text-[9px] uppercase font-bold text-healthcare-subtext">Blood Type</p>
              <p className="text-2xl font-black text-healthcare-critical">{payload.bloodType}</p>
            </div>
          </div>

          {payload.allergies.length > 0 && (
            <div className="healthcare-card-warn p-4 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-healthcare-critical font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Severe Allergies &amp; Medical Alerts</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {payload.allergies.map((allergy, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white border border-healthcare-warn text-healthcare-critical">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {payload.emergencyContact.name && (
            <div className="bg-healthcare-panel p-4 rounded-xl border border-healthcare-border flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-healthcare-subtext">Primary Emergency Contact</p>
                <p className="text-sm font-bold text-healthcare-text">{payload.emergencyContact.name}</p>
                <p className="text-xs text-healthcare-subtext">{payload.emergencyContact.phone}</p>
              </div>
              <a
                href={`tel:${payload.emergencyContact.phone}`}
                className="px-3.5 py-2 bg-healthcare-accent hover:bg-healthcare-accentHover text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-healthcare-panel border border-healthcare-border">
              <p className="font-bold text-healthcare-subtext text-[10px] uppercase">Chronic Conditions</p>
              <p className="text-healthcare-text mt-0.5">
                {payload.chronicConditions.join(', ') || 'None recorded'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-healthcare-panel border border-healthcare-border">
              <p className="font-bold text-healthcare-subtext text-[10px] uppercase">Current Medications</p>
              <p className="text-healthcare-text mt-0.5">
                {payload.medications.join(', ') || 'None recorded'}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
