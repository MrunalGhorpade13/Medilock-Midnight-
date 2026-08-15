import React, { useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, Zap, Sparkles } from 'lucide-react';
import { lockboxService } from '../../services/lockbox-service';

interface ScanReaderProps {
  onScanComplete: (contractAddress: string, commitmentHash: string) => void;
  isScanning: boolean;
}

export const ScanReader: React.FC<ScanReaderProps> = ({ onScanComplete, isScanning }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const handleAutoFillDemo = () => {
    const demoPayloadStr = lockboxService.generateQrPayload();
    const parsed = lockboxService.parseQrPayload(demoPayloadStr);
    if (parsed) {
      onScanComplete(parsed.contractAddress, parsed.recordCommitment);
    }
  };

  const startCameraScanner = () => {
    try {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }

      const scanner = new Html5QrcodeScanner(
        "qr-reader-container",
        { fps: 10, qrbox: { width: 220, height: 220 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          const parsed = lockboxService.parseQrPayload(decodedText);
          if (parsed) {
            onScanComplete(parsed.contractAddress, parsed.recordCommitment);
            scanner.clear();
          } else {
            alert('Unrecognized Medical ID QR Code');
          }
        },
        () => {}
      );

      scannerRef.current = scanner;
    } catch (e) {
      console.warn('Camera scanner exception', e);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="healthcare-card p-6 sm:p-8 space-y-6 text-center max-w-xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-healthcare-panel flex items-center justify-center mx-auto text-healthcare-accent">
        <QrCode className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-healthcare-text">Scan Patient Medical ID</h2>
        <p className="text-xs text-healthcare-subtext max-w-sm mx-auto">
          Scan the QR code on the patient's phone screen or printed medical ID card to view emergency vitals instantly.
        </p>
      </div>

      <div id="qr-reader-container" className="w-full rounded-2xl overflow-hidden bg-healthcare-panel min-h-[40px]" />

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={startCameraScanner}
          disabled={isScanning}
          className="w-full sm:w-auto px-6 py-3 bg-healthcare-accent hover:bg-healthcare-accentHover text-white font-bold text-xs rounded-xl shadow-healthcare transition-colors flex items-center justify-center space-x-2"
        >
          <Zap className="w-4 h-4" />
          <span>Open Camera Scanner</span>
        </button>

        <button
          onClick={handleAutoFillDemo}
          disabled={isScanning}
          className="w-full sm:w-auto px-6 py-3 bg-healthcare-panel hover:bg-healthcare-panelDark text-healthcare-text font-bold text-xs rounded-xl border border-healthcare-border transition-colors flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4 text-healthcare-accent" />
          <span>Demo Scan (Auto-Fill)</span>
        </button>
      </div>
    </div>
  );
};
