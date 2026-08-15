import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  QrCode,
  RefreshCw,
  Printer,
  AlertTriangle,
  FileText,
  CheckCircle2,
  PhoneCall,
  Heart,
  Pill,
  ChevronRight,
  Download,
  ArrowLeft
} from 'lucide-react';
import { lockboxService } from '../services/lockbox-service';
import {
  MedicalPayload,
  PublicLedgerState,
} from '@contract/types';
import { midnightWallet } from '../services/wallet';
import { midnightProvider } from '../services/midnight-provider';

interface PatientViewProps {
  onStateUpdated: () => void;
}

type PageView = 'FORM' | 'QR' | 'CARD';

export const PatientView: React.FC<PatientViewProps> = ({ onStateUpdated }) => {
  const [ledgerState, setLedgerState] = useState<PublicLedgerState>(lockboxService.getPublicLedgerState());
  const [payload, setPayload] = useState<MedicalPayload | null>(lockboxService.getShieldedMedicalPayload());

  // Default: show FORM if empty, CARD if already registered
  const [page, setPage] = useState<PageView>(
    lockboxService.getPublicLedgerState().state === 'EMPTY' ? 'FORM' : 'CARD'
  );

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state
  const [fullName, setFullName] = useState(payload?.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(payload?.dateOfBirth || '');
  const [bloodType, setBloodType] = useState<MedicalPayload['bloodType']>(payload?.bloodType || 'O-');
  const [allergiesInput, setAllergiesInput] = useState(payload?.allergies.join(', ') || '');
  const [conditionsInput, setConditionsInput] = useState(payload?.chronicConditions.join(', ') || '');
  const [medicationsInput, setMedicationsInput] = useState(payload?.medications.join(', ') || '');
  const [contactName, setContactName] = useState(payload?.emergencyContact.name || '');
  const [contactPhone, setContactPhone] = useState(payload?.emergencyContact.phone || '');
  const [specialInstructions, setSpecialInstructions] = useState(payload?.specialInstructions || '');
  const [organDonor, setOrganDonor] = useState(payload?.organDonor ?? true);

  const [isRegistering, setIsRegistering] = useState(false);

  // QR download ref
  const qrSvgRef = useRef<SVGSVGElement | null>(null);

  const refreshLocalState = () => {
    const publicState = lockboxService.getPublicLedgerState();
    const localPayload = lockboxService.getShieldedMedicalPayload();
    setLedgerState(publicState);
    setPayload(localPayload);
    if (localPayload) {
      midnightWallet.updatePatientName(localPayload.fullName);
      window.dispatchEvent(new Event('patient-name-updated'));
    }
    onStateUpdated();
  };

  useEffect(() => {
    refreshLocalState();
    const handleWalletChange = () => refreshLocalState();
    window.addEventListener('wallet-role-changed', handleWalletChange);
    return () => window.removeEventListener('wallet-role-changed', handleWalletChange);
  }, []);

  const handleRegisterRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setSaveSuccess(false);

    try {
      // Trigger Lace Wallet authentication popup & state sync
      await midnightProvider.connectLaceWallet();

      const updatedPayload: MedicalPayload = {
        fullName: fullName.trim(),
        dateOfBirth: dateOfBirth.trim(),
        bloodType,
        allergies: allergiesInput.split(',').map(s => s.trim()).filter(Boolean),
        chronicConditions: conditionsInput.split(',').map(s => s.trim()).filter(Boolean),
        medications: medicationsInput.split(',').map(s => s.trim()).filter(Boolean),
        emergencyContact: {
          name: contactName.trim(),
          relationship: 'Primary Contact',
          phone: contactPhone.trim(),
        },
        organDonor,
        specialInstructions,
        lastUpdatedTimestamp: Date.now(),
      };

      const activeWallet = midnightWallet.getActiveAccount();
      midnightWallet.updatePatientName(updatedPayload.fullName);
      window.dispatchEvent(new Event('patient-name-updated'));
      await lockboxService.registerMedicalRecord(activeWallet.secretKeyHex, updatedPayload);
      refreshLocalState();
      setSaveSuccess(true);
      setPage('QR'); // Go straight to QR page after saving
    } catch (err: any) {
      alert(`Registration Error: ${err.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  // Download the QR as a PNG image file
  const handleDownloadQr = () => {
    const svg = document.querySelector('#medilock-qr svg') as SVGSVGElement | null;
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.download = `medilock-qr-${fullName.replace(/\s+/g, '-').toLowerCase() || 'emergency-id'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = url;
  };

  const qrString = lockboxService.generateQrPayload();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Top Page Navigation */}
      <div className="flex items-center bg-white border border-healthcare-border rounded-2xl p-1 shadow-healthcare">
        <button
          onClick={() => setPage('CARD')}
          disabled={ledgerState.state === 'EMPTY'}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            page === 'CARD'
              ? 'bg-healthcare-accent text-white shadow-sm'
              : ledgerState.state === 'EMPTY'
              ? 'text-healthcare-border cursor-not-allowed'
              : 'text-healthcare-subtext hover:text-healthcare-text hover:bg-healthcare-panel'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>My Medical ID</span>
        </button>

        <button
          onClick={() => setPage('QR')}
          disabled={ledgerState.state === 'EMPTY'}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            page === 'QR'
              ? 'bg-healthcare-accent text-white shadow-sm'
              : ledgerState.state === 'EMPTY'
              ? 'text-healthcare-border cursor-not-allowed'
              : 'text-healthcare-subtext hover:text-healthcare-text hover:bg-healthcare-panel'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>My QR Code</span>
        </button>

        <button
          onClick={() => setPage('FORM')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            page === 'FORM'
              ? 'bg-healthcare-accent text-white shadow-sm'
              : 'text-healthcare-subtext hover:text-healthcare-text hover:bg-healthcare-panel'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{ledgerState.state === 'EMPTY' ? 'Create Medical ID' : 'Edit Information'}</span>
        </button>
      </div>

      {/* ================================================================== */}
      {/* PAGE: FORM                                                           */}
      {/* ================================================================== */}
      {page === 'FORM' && (
        <div className="bg-white border border-healthcare-border rounded-2xl shadow-healthcare p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-healthcare-border pb-4">
            <h2 className="text-lg font-bold text-healthcare-text flex items-center space-x-2">
              <Lock className="w-5 h-5 text-healthcare-accent" />
              <span>{ledgerState.state === 'EMPTY' ? 'Create Your Medical ID' : 'Update Medical Information'}</span>
            </h2>
            <p className="text-xs text-healthcare-subtext mt-1">
              Fill in your details. Your information is stored securely and only accessible to authorised emergency responders.
            </p>
          </div>

          {/* Save success banner */}
          {saveSuccess && (
            <div className="flex items-center space-x-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm font-medium text-green-700">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Medical ID saved successfully! Your QR code is ready.</span>
            </div>
          )}

          <form onSubmit={handleRegisterRecord} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-healthcare-text mb-1.5">Full Legal Name</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="Your full name..."
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full border border-healthcare-border rounded-xl px-3 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent bg-healthcare-panel"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-healthcare-text mb-1.5">Date of Birth</label>
                <input
                  type="text"
                  required
                  placeholder="DD-MM-YYYY"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  className="w-full border border-healthcare-border rounded-xl px-3 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent bg-healthcare-panel"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-healthcare-text mb-1.5">Blood Type</label>
                <select
                  value={bloodType}
                  onChange={e => setBloodType(e.target.value as any)}
                  className="w-full border border-healthcare-border rounded-xl px-3 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent bg-healthcare-panel"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-healthcare-text mb-1.5">Organ Donor</label>
                <label className="flex items-center space-x-2 border border-healthcare-border rounded-xl px-3 py-2.5 text-sm text-healthcare-text cursor-pointer bg-healthcare-panel">
                  <input
                    type="checkbox"
                    checked={organDonor}
                    onChange={e => setOrganDonor(e.target.checked)}
                    className="rounded border-healthcare-border text-healthcare-accent focus:ring-0"
                  />
                  <span>Registered Organ Donor</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-healthcare-text mb-1.5">Severe Allergies <span className="font-normal text-healthcare-subtext">(comma separated)</span></label>
              <input
                type="text"
                autoComplete="off"
                placeholder="e.g. Penicillin, Latex..."
                value={allergiesInput}
                onChange={e => setAllergiesInput(e.target.value)}
                className="w-full border border-healthcare-border rounded-xl px-3 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent bg-healthcare-panel"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-healthcare-text mb-1.5">Chronic Conditions <span className="font-normal text-healthcare-subtext">(comma separated)</span></label>
              <input
                type="text"
                autoComplete="off"
                placeholder="e.g. Type 1 Diabetes, Epilepsy..."
                value={conditionsInput}
                onChange={e => setConditionsInput(e.target.value)}
                className="w-full border border-healthcare-border rounded-xl px-3 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent bg-healthcare-panel"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-healthcare-text mb-1.5">Current Medications <span className="font-normal text-healthcare-subtext">(comma separated)</span></label>
              <input
                type="text"
                autoComplete="off"
                placeholder="e.g. Metformin, Insulin..."
                value={medicationsInput}
                onChange={e => setMedicationsInput(e.target.value)}
                className="w-full border border-healthcare-border rounded-xl px-3 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent bg-healthcare-panel"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-healthcare-text mb-1.5">Emergency Contact Name</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="Contact name..."
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full border border-healthcare-border rounded-xl px-3 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent bg-healthcare-panel"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-healthcare-text mb-1.5">Emergency Contact Phone</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="Phone number..."
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full border border-healthcare-border rounded-xl px-3 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent bg-healthcare-panel"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-healthcare-text mb-1.5">Special Paramedic Instructions <span className="font-normal text-healthcare-subtext">(optional)</span></label>
              <textarea
                rows={2}
                placeholder="e.g. Has a pacemaker on the left side..."
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
                className="w-full border border-healthcare-border rounded-xl px-3 py-2.5 text-sm text-healthcare-text focus:outline-none focus:border-healthcare-accent bg-healthcare-panel"
              />
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-3.5 px-4 bg-healthcare-accent text-white font-bold text-sm rounded-xl shadow-healthcare hover:opacity-95 transition-all flex items-center justify-center space-x-2"
            >
              {isRegistering ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save & Generate QR Code</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ================================================================== */}
      {/* PAGE: QR CODE                                                        */}
      {/* ================================================================== */}
      {page === 'QR' && ledgerState.state !== 'EMPTY' && (
        <div className="animate-in fade-in duration-200 flex flex-col items-center space-y-6">
          <div className="bg-white border border-healthcare-border rounded-2xl shadow-healthcare p-8 flex flex-col items-center space-y-6 max-w-sm w-full mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-healthcare-text">Your Emergency QR Code</h2>
              <p className="text-xs text-healthcare-subtext">
                Show or print this QR code. Emergency responders scan it to access your medical record.
              </p>
            </div>

            {/* QR code rendered into a div with id for download capture */}
            <div id="medilock-qr" className="p-5 rounded-2xl bg-white border-2 border-healthcare-border shadow-md">
              <QRCodeSVG
                value={qrString}
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="w-full space-y-3">
              {/* Download QR as PNG */}
              <button
                onClick={handleDownloadQr}
                className="w-full py-3 px-4 bg-healthcare-accent text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 hover:opacity-95 transition-all shadow-healthcare"
              >
                <Download className="w-4 h-4" />
                <span>Download QR as Image</span>
              </button>

              {/* Print */}
              <button
                onClick={() => window.print()}
                className="w-full py-3 px-4 bg-healthcare-panel border border-healthcare-border text-healthcare-text font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 hover:bg-healthcare-panelDark transition-all"
              >
                <Printer className="w-4 h-4 text-healthcare-accent" />
                <span>Print Medical ID Card</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setPage('CARD')}
            className="flex items-center space-x-1.5 text-sm font-medium text-healthcare-accent hover:underline"
          >
            <span>View My Medical Card</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================================================================== */}
      {/* PAGE: CARD — Emergency ID Summary                                    */}
      {/* ================================================================== */}
      {page === 'CARD' && ledgerState.state !== 'EMPTY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">

          {/* Left: Summary */}
          <div className="lg:col-span-8 bg-white border border-healthcare-border rounded-2xl shadow-healthcare p-6 sm:p-8 space-y-6">

            <div className="flex items-start justify-between pb-4 border-b border-healthcare-border">
              <div>
                <span className="text-[10px] font-semibold text-healthcare-subtext uppercase tracking-widest">
                  Emergency Medical ID
                </span>
                <h2 className="text-2xl font-extrabold text-healthcare-text mt-0.5">
                  {fullName || payload?.fullName || 'Patient Record'}
                </h2>
                <p className="text-xs text-healthcare-subtext mt-0.5">
                  DOB: {dateOfBirth || payload?.dateOfBirth || '—'} &bull; Organ Donor: <span className="font-semibold text-healthcare-accent">{organDonor ? 'YES' : 'NO'}</span>
                </p>
              </div>

              <div className="px-4 py-2.5 rounded-2xl bg-red-50 border border-red-200 text-center">
                <p className="text-[9px] uppercase font-bold tracking-wider text-red-400">Blood Type</p>
                <p className="text-2xl font-black text-red-600">{bloodType || payload?.bloodType}</p>
              </div>
            </div>

            {/* Allergies */}
            {(allergiesInput || (payload?.allergies.length ?? 0) > 0) && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
                <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Severe Allergies & Medical Alerts</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(allergiesInput || payload?.allergies.join(', ') || '').split(',').map((allergy, i) => allergy.trim() && (
                    <span key={i} className="px-3 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                      {allergy.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {(contactName || payload?.emergencyContact.name) && (
              <div className="p-4 rounded-xl bg-healthcare-panel border border-healthcare-border flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-healthcare-subtext uppercase tracking-wider">Primary Emergency Contact</p>
                  <p className="text-sm font-bold text-healthcare-text mt-0.5">{contactName || payload?.emergencyContact.name}</p>
                  <p className="text-xs text-healthcare-subtext">{contactPhone || payload?.emergencyContact.phone}</p>
                </div>
                <a
                  href={`tel:${contactPhone || payload?.emergencyContact.phone}`}
                  className="px-4 py-2.5 bg-healthcare-accent hover:opacity-90 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-colors shadow-healthcare"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
              </div>
            )}

            {/* Conditions + Medications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-healthcare-panel border border-healthcare-border space-y-1.5">
                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider flex items-center space-x-1">
                  <Heart className="w-3 h-3" />
                  <span>Chronic Conditions</span>
                </p>
                <p className="text-sm text-healthcare-text leading-relaxed">
                  {conditionsInput || payload?.chronicConditions.join(', ') || 'None recorded'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-healthcare-panel border border-healthcare-border space-y-1.5">
                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center space-x-1">
                  <Pill className="w-3 h-3" />
                  <span>Current Medications</span>
                </p>
                <p className="text-sm text-healthcare-text leading-relaxed">
                  {medicationsInput || payload?.medications.join(', ') || 'None recorded'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setPage('FORM')}
                className="text-xs font-medium text-healthcare-accent hover:underline flex items-center space-x-1"
              >
                <span>Edit Medical Information</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: QR thumbnail */}
          <div className="lg:col-span-4 bg-white border border-healthcare-border rounded-2xl shadow-healthcare p-6 flex flex-col items-center space-y-4 text-center">
            <h3 className="text-sm font-bold text-healthcare-text">Emergency QR Code</h3>
            <div className="p-3 rounded-xl bg-white border border-healthcare-border shadow-sm">
              <QRCodeSVG value={qrString} size={140} level="H" includeMargin={false} />
            </div>
            <p className="text-xs text-healthcare-subtext">
              Paramedics scan this QR to access your record in an emergency.
            </p>
            <button
              onClick={() => setPage('QR')}
              className="w-full py-2.5 bg-healthcare-panel border border-healthcare-border text-healthcare-text font-semibold text-xs rounded-xl hover:bg-healthcare-panelDark transition-all flex items-center justify-center space-x-2"
            >
              <Download className="w-3.5 h-3.5 text-healthcare-accent" />
              <span>Download / Print QR</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty state prompt */}
      {ledgerState.state === 'EMPTY' && page !== 'FORM' && (
        <div className="bg-white border border-healthcare-border rounded-2xl p-8 text-center space-y-4 shadow-healthcare">
          <ShieldCheck className="w-10 h-10 mx-auto text-healthcare-accent opacity-50" />
          <div>
            <h3 className="text-base font-bold text-healthcare-text">No Medical ID Yet</h3>
            <p className="text-xs text-healthcare-subtext mt-1">Fill in your medical information to generate your Emergency QR code.</p>
          </div>
          <button
            onClick={() => setPage('FORM')}
            className="px-6 py-2.5 bg-healthcare-accent text-white font-bold rounded-xl text-sm shadow-healthcare hover:opacity-95 transition-opacity"
          >
            Create Medical ID
          </button>
        </div>
      )}

    </div>
  );
};
