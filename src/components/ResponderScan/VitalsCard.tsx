import React from 'react';
import { MedicalPayload } from '@contract/types';
import {
  AlertTriangle,
  PhoneCall,
  Lock,
  Heart,
  Pill,
  RotateCcw
} from 'lucide-react';

interface VitalsCardProps {
  payload: MedicalPayload | null;
  accessSuccess: boolean;
  onResetScan: () => void;
}

export const VitalsCard: React.FC<VitalsCardProps> = ({
  payload,
  accessSuccess,
  onResetScan,
}) => {
  if (!accessSuccess || !payload) {
    return (
      <div className="healthcare-card-critical p-6 sm:p-8 space-y-4 text-center max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-white border border-healthcare-critical flex items-center justify-center mx-auto text-healthcare-critical">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-healthcare-critical">Medical ID Inaccessible</h3>
          <p className="text-sm text-healthcare-text font-medium">
            This medical ID is not currently active or could not be verified.
          </p>
        </div>

        <p className="text-xs text-healthcare-subtext max-w-sm mx-auto">
          If you are a paramedic with an authorized squad key, check that the patient's card is switched to "Active".
        </p>

        <button
          onClick={onResetScan}
          className="px-5 py-2.5 bg-healthcare-text hover:bg-black text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center space-x-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Scan Another Code</span>
        </button>
      </div>
    );
  }

  return (
    <div className="healthcare-card p-6 sm:p-8 space-y-6 max-w-3xl mx-auto shadow-healthcare-lg border-2 border-healthcare-accent">
      
      {/* Top Banner */}
      <div className="flex items-start justify-between border-b border-healthcare-border pb-4">
        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-healthcare-panel text-healthcare-accent uppercase tracking-wider">
            VERIFIED EMERGENCY RECORD
          </span>
          <h2 className="text-2xl font-extrabold text-healthcare-text mt-1">
            {payload.fullName}
          </h2>
          <p className="text-xs text-healthcare-subtext mt-0.5">
            DOB: {payload.dateOfBirth} &bull; Organ Donor: <span className="font-bold text-healthcare-accent">{payload.organDonor ? 'YES' : 'NO'}</span>
          </p>
        </div>

        <div className="px-5 py-2.5 rounded-2xl bg-healthcare-warnBg border-2 border-healthcare-warn text-healthcare-text text-center">
          <p className="text-[9px] uppercase font-bold text-healthcare-subtext">Blood Group</p>
          <p className="text-3xl font-black text-healthcare-critical">{payload.bloodType}</p>
        </div>
      </div>

      {/* Allergies Highlight */}
      {payload.allergies.length > 0 && (
        <div className="healthcare-card-warn p-4.5 space-y-2">
          <div className="flex items-center space-x-2 text-healthcare-critical font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Severe Allergies &amp; Medical Warnings</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {payload.allergies.map((allergy, i) => (
              <span key={i} className="px-3 py-1 rounded-xl text-xs font-bold bg-white border border-healthcare-warn text-healthcare-critical shadow-sm">
                {allergy}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contact */}
      {payload.emergencyContact.name && (
        <div className="bg-healthcare-panel p-4 rounded-2xl border border-healthcare-border flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-healthcare-subtext">Primary Emergency Contact</p>
            <p className="text-base font-bold text-healthcare-text mt-0.5">{payload.emergencyContact.name}</p>
            <p className="text-xs text-healthcare-subtext font-mono">{payload.emergencyContact.phone}</p>
          </div>

          <a
            href={`tel:${payload.emergencyContact.phone}`}
            className="px-4 py-2.5 bg-healthcare-accent hover:bg-healthcare-accentHover text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-colors shadow-healthcare"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Contact</span>
          </a>
        </div>
      )}

      {/* Conditions & Medications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-healthcare-panel border border-healthcare-border space-y-1">
          <p className="text-[10px] font-bold text-healthcare-subtext uppercase flex items-center space-x-1">
            <Heart className="w-3.5 h-3.5 text-healthcare-accent" />
            <span>Chronic Conditions</span>
          </p>
          <p className="text-xs text-healthcare-text leading-relaxed font-medium">
            {payload.chronicConditions.join(', ') || 'None recorded'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-healthcare-panel border border-healthcare-border space-y-1">
          <p className="text-[10px] font-bold text-healthcare-subtext uppercase flex items-center space-x-1">
            <Pill className="w-3.5 h-3.5 text-healthcare-accent" />
            <span>Current Medications</span>
          </p>
          <p className="text-xs text-healthcare-text leading-relaxed font-medium">
            {payload.medications.join(', ') || 'None recorded'}
          </p>
        </div>
      </div>

      {payload.specialInstructions && (
        <div className="p-4 rounded-2xl bg-white border border-healthcare-border space-y-1">
          <p className="text-[10px] font-bold text-healthcare-subtext uppercase">Notes for Paramedics:</p>
          <p className="text-xs text-healthcare-text italic leading-relaxed">
            "{payload.specialInstructions}"
          </p>
        </div>
      )}

      <div className="pt-2 flex justify-center">
        <button
          onClick={onResetScan}
          className="px-6 py-2.5 bg-healthcare-panel hover:bg-healthcare-panelDark text-healthcare-text font-bold text-xs rounded-xl border border-healthcare-border transition-colors flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Scan Next Patient</span>
        </button>
      </div>

    </div>
  );
};
