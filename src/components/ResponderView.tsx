import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Stethoscope,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  PhoneCall,
  AlertTriangle,
  Heart,
  Pill,
  RefreshCw,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { lockboxService } from '../services/lockbox-service';
import { MedicalPayload, ZkProofResult } from '@contract/types';
import { midnightWallet } from '../services/wallet';

interface ResponderViewProps {
  onAccessRequested: () => void;
}

export const ResponderView: React.FC<ResponderViewProps> = ({ onAccessRequested }) => {
  const [qrLoaded, setQrLoaded] = useState(false);
  const [activeAccount, setActiveAccount] = useState(midnightWallet.getActiveAccount());
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Workflow states
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [decryptedPayload, setDecryptedPayload] = useState<MedicalPayload | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [verifiedZkProof, setVerifiedZkProof] = useState<ZkProofResult | null>(null);

  const refreshAccount = () => {
    setActiveAccount(midnightWallet.getActiveAccount());
  };

  useEffect(() => {
    refreshAccount();
    const handleWalletChange = () => refreshAccount();
    window.addEventListener('wallet-role-changed', handleWalletChange);
    window.addEventListener('patient-name-updated', handleWalletChange);
    return () => {
      window.removeEventListener('wallet-role-changed', handleWalletChange);
      window.removeEventListener('patient-name-updated', handleWalletChange);
    };
  }, []);

  // Handle QR image file upload and decode
  const handleQrImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setQrLoaded(false);
    setDecryptedPayload(null);
    setAccessError(null);
    setVerifiedZkProof(null);

    try {
      const html5Qrcode = new Html5Qrcode('qr-upload-region');
      const decodedText = await html5Qrcode.scanFile(file, /* showImage= */ false);
      const parsed = lockboxService.parseQrPayload(decodedText);

      if (!parsed) {
        setUploadError('This image does not contain a valid MediLock QR code. Please upload the correct QR file.');
        return;
      }

      setQrLoaded(true);
    } catch (err: any) {
      setUploadError('Could not read the QR code from this image. Make sure the image is clear and contains the correct QR code.');
    }

    // Reset the input so the same file can be re-uploaded
    e.target.value = '';
  };

  const handleExecuteRequestAccess = async () => {
    setIsGeneratingProof(true);
    setAccessError(null);
    setDecryptedPayload(null);
    setVerifiedZkProof(null);

    try {
      const currentWallet = midnightWallet.getActiveAccount();
      const result = await lockboxService.requestAccess(currentWallet.secretKeyHex);

      if (result.success && result.payload) {
        setDecryptedPayload(result.payload);
        setVerifiedZkProof(result.zkProof);
      } else {
        setAccessError(result.errorReason || 'Access request rejected.');
        setVerifiedZkProof(result.zkProof);
      }

      onAccessRequested();
    } catch (err: any) {
      setAccessError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsGeneratingProof(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="bg-white border border-healthcare-border rounded-2xl shadow-healthcare p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-500">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-healthcare-text">Scan Medical ID</h2>
            <p className="text-xs text-healthcare-subtext">
              Upload the patient's Emergency QR code image to access their medical record.
            </p>
          </div>
        </div>

        <div className="px-3 py-2 rounded-xl bg-healthcare-panel border border-healthcare-border text-right text-xs">
          <span className="text-healthcare-subtext block text-[10px] uppercase tracking-wide">Responder Wallet</span>
          <span className={`font-bold ${
            activeAccount.isResponderAuthorized !== false ? 'text-teal-600' : 'text-red-500'
          }`}>
            {activeAccount.name}
          </span>
        </div>
      </div>

      {/* Hidden div required by Html5Qrcode for scanFile */}
      <div id="qr-upload-region" className="hidden" />

      {/* QR Upload Card */}
      <div className="bg-white border border-healthcare-border rounded-2xl shadow-healthcare p-6 sm:p-8 space-y-5">
        <h3 className="text-sm font-bold text-healthcare-text flex items-center space-x-2">
          <QrCode className="w-4 h-4 text-healthcare-accent" />
          <span>Upload Patient QR Code</span>
        </h3>

        {!qrLoaded ? (
          /* Upload area */
          <label
            htmlFor="qr-file-input"
            className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-healthcare-border rounded-2xl cursor-pointer bg-healthcare-panel hover:bg-healthcare-panelDark transition-colors group"
          >
            <Upload className="w-8 h-8 text-healthcare-accent mb-2 group-hover:scale-105 transition-transform" />
            <p className="text-sm font-semibold text-healthcare-text">Upload QR Image</p>
            <p className="text-xs text-healthcare-subtext mt-1">Click to select the patient's downloaded QR code image</p>
            <input
              id="qr-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleQrImageUpload}
            />
          </label>
        ) : (
          /* QR successfully loaded — show status and action */
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 rounded-xl bg-green-50 border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-700">QR Code Recognised</p>
                <p className="text-xs text-green-600">Patient emergency record located. Click below to request access.</p>
              </div>
            </div>

            {/* Re-upload option */}
            <label
              htmlFor="qr-file-input-reload"
              className="inline-flex items-center space-x-1.5 text-xs text-healthcare-subtext hover:text-healthcare-text cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload a different QR code</span>
              <input
                id="qr-file-input-reload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleQrImageUpload}
              />
            </label>
          </div>
        )}

        {/* Upload error */}
        {uploadError && (
          <div className="flex items-start space-x-2 p-3.5 rounded-xl bg-red-50 border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">{uploadError}</p>
          </div>
        )}

        {/* Access button */}
        <button
          onClick={handleExecuteRequestAccess}
          disabled={isGeneratingProof || !qrLoaded}
          className={`w-full py-3.5 px-4 font-bold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all ${
            qrLoaded && !isGeneratingProof
              ? 'bg-healthcare-accent text-white shadow-healthcare hover:opacity-95'
              : 'bg-healthcare-border text-healthcare-subtext cursor-not-allowed'
          }`}
        >
          {isGeneratingProof ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying access...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>View Medical Record</span>
            </>
          )}
        </button>

        {/* Access denied error */}
        {accessError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-1.5">
            <div className="flex items-center space-x-2 text-red-600 font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Access Denied</span>
            </div>
            <p className="text-xs text-red-500 leading-relaxed">{accessError}</p>
          </div>
        )}
      </div>

      {/* Decrypted Emergency Medical Card */}
      {decryptedPayload && (
        <div className="bg-white border-2 border-teal-300 rounded-2xl shadow-healthcare p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">

          <div className="flex items-start justify-between pb-4 border-b border-healthcare-border">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider">
                Emergency Medical Record
              </span>
              <h3 className="text-2xl font-extrabold text-healthcare-text mt-1">
                {decryptedPayload.fullName}
              </h3>
              <p className="text-xs text-healthcare-subtext mt-0.5">
                DOB: {decryptedPayload.dateOfBirth} &bull; Organ Donor: {decryptedPayload.organDonor ? 'YES' : 'NO'}
              </p>
            </div>

            <div className="px-5 py-2.5 rounded-2xl bg-red-50 border border-red-200 text-center">
              <p className="text-[9px] uppercase font-bold tracking-wider text-red-400">Blood Type</p>
              <p className="text-2xl font-black text-red-600">{decryptedPayload.bloodType}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {decryptedPayload.allergies.length > 0 && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
                <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Severe Allergies</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {decryptedPayload.allergies.map((allergy, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-healthcare-panel border border-healthcare-border space-y-3 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-semibold text-healthcare-subtext uppercase tracking-wider">Emergency Contact</p>
                <p className="text-sm font-bold text-healthcare-text mt-1">{decryptedPayload.emergencyContact.name}</p>
                <p className="text-xs text-healthcare-subtext">{decryptedPayload.emergencyContact.phone}</p>
              </div>
              <a
                href={`tel:${decryptedPayload.emergencyContact.phone}`}
                className="w-full py-2.5 bg-healthcare-accent hover:opacity-90 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {decryptedPayload.emergencyContact.phone}</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-healthcare-panel border border-healthcare-border space-y-1.5">
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>Chronic Conditions</span>
              </p>
              <p className="text-sm text-healthcare-text">
                {decryptedPayload.chronicConditions.join(', ') || 'None recorded'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-healthcare-panel border border-healthcare-border space-y-1.5">
              <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center space-x-1">
                <Pill className="w-3 h-3" />
                <span>Current Medications</span>
              </p>
              <p className="text-sm text-healthcare-text">
                {decryptedPayload.medications.join(', ') || 'None recorded'}
              </p>
            </div>
          </div>

          {decryptedPayload.specialInstructions && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Special Paramedic Instructions</p>
              <p className="text-sm text-amber-700 italic leading-relaxed">
                "{decryptedPayload.specialInstructions}"
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
