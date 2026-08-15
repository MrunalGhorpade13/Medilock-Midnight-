import React, { useState } from 'react';
import { MedicalPayload } from '@contract/types';
import { ShieldCheck, RefreshCw } from 'lucide-react';

interface PatientFormProps {
  initialPayload: MedicalPayload | null;
  onSubmit: (payload: MedicalPayload) => Promise<void>;
  isSaving: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({ initialPayload, onSubmit, isSaving }) => {
  const [fullName, setFullName] = useState(initialPayload?.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialPayload?.dateOfBirth || '');
  const [bloodType, setBloodType] = useState<MedicalPayload['bloodType']>(initialPayload?.bloodType || 'O-');
  const [allergies, setAllergies] = useState(initialPayload?.allergies.join(', ') || '');
  const [conditions, setConditions] = useState(initialPayload?.chronicConditions.join(', ') || '');
  const [medications, setMedications] = useState(initialPayload?.medications.join(', ') || '');
  const [contactName, setContactName] = useState(initialPayload?.emergencyContact.name || '');
  const [contactPhone, setContactPhone] = useState(initialPayload?.emergencyContact.phone || '');
  const [specialInstructions, setSpecialInstructions] = useState(initialPayload?.specialInstructions || '');
  const [organDonor, setOrganDonor] = useState(initialPayload?.organDonor ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPayload: MedicalPayload = {
      fullName: fullName.trim(),
      dateOfBirth: dateOfBirth.trim(),
      bloodType,
      allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
      chronicConditions: conditions.split(',').map(s => s.trim()).filter(Boolean),
      medications: medications.split(',').map(s => s.trim()).filter(Boolean),
      emergencyContact: {
        name: contactName.trim(),
        relationship: 'Primary Contact',
        phone: contactPhone.trim(),
      },
      organDonor,
      specialInstructions: specialInstructions.trim(),
      lastUpdatedTimestamp: Date.now(),
    };

    onSubmit(updatedPayload);
  };

  return (
    <div className="healthcare-card p-6 sm:p-8 space-y-6">
      <div className="border-b border-healthcare-border pb-4">
        <h2 className="text-lg font-bold text-healthcare-text">Your Emergency Medical Information</h2>
        <p className="text-xs text-healthcare-subtext mt-1">
          Information entered here is encrypted locally and accessible only to verified emergency personnel when scanning your QR code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-healthcare-text mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full bg-healthcare-panel border border-healthcare-border rounded-xl px-3.5 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-healthcare-text mb-1">Date of Birth</label>
            <input
              type="text"
              required
              placeholder="e.g. 1990-05-15"
              value={dateOfBirth}
              onChange={e => setDateOfBirth(e.target.value)}
              className="w-full bg-healthcare-panel border border-healthcare-border rounded-xl px-3.5 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-healthcare-text mb-1">Blood Type</label>
            <select
              value={bloodType}
              onChange={e => setBloodType(e.target.value as any)}
              className="w-full bg-healthcare-panel border border-healthcare-border rounded-xl px-3.5 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent"
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(bt => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-healthcare-text mb-1">Organ Donor Status</label>
            <label className="flex items-center space-x-2.5 bg-healthcare-panel border border-healthcare-border rounded-xl px-3.5 py-2.5 text-sm text-healthcare-text cursor-pointer">
              <input
                type="checkbox"
                checked={organDonor}
                onChange={e => setOrganDonor(e.target.checked)}
                className="rounded border-healthcare-border text-healthcare-accent focus:ring-0 w-4 h-4"
              />
              <span className="font-medium text-xs">Registered Organ Donor</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-healthcare-text mb-1">Severe Allergies (comma separated)</label>
          <input
            type="text"
            placeholder="e.g. Penicillin, Latex, Peanuts"
            value={allergies}
            onChange={e => setAllergies(e.target.value)}
            className="w-full bg-healthcare-panel border border-healthcare-border rounded-xl px-3.5 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-healthcare-text mb-1">Chronic Conditions (comma separated)</label>
          <input
            type="text"
            placeholder="e.g. Type 1 Diabetes, Asthma, Epilepsy"
            value={conditions}
            onChange={e => setConditions(e.target.value)}
            className="w-full bg-healthcare-panel border border-healthcare-border rounded-xl px-3.5 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-healthcare-text mb-1">Current Medications (comma separated)</label>
          <input
            type="text"
            placeholder="e.g. Insulin, Albuterol"
            value={medications}
            onChange={e => setMedications(e.target.value)}
            className="w-full bg-healthcare-panel border border-healthcare-border rounded-xl px-3.5 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-healthcare-text mb-1">Emergency Contact Name</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe (Spouse)"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              className="w-full bg-healthcare-panel border border-healthcare-border rounded-xl px-3.5 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-healthcare-text mb-1">Emergency Contact Phone</label>
            <input
              type="text"
              required
              placeholder="e.g. +1 555-0199"
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              className="w-full bg-healthcare-panel border border-healthcare-border rounded-xl px-3.5 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-healthcare-text mb-1">Special Notes for Paramedics</label>
          <textarea
            rows={2}
            placeholder="Any additional vital notes..."
            value={specialInstructions}
            onChange={e => setSpecialInstructions(e.target.value)}
            className="w-full bg-healthcare-panel border border-healthcare-border rounded-xl px-3.5 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 px-4 bg-healthcare-accent hover:bg-healthcare-accentHover text-white font-bold text-sm rounded-xl shadow-healthcare transition-all flex items-center justify-center space-x-2"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Your ID Securely...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Save &amp; Generate Digital Medical ID</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
