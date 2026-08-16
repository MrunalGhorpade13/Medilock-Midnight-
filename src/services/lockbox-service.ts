// Lockbox Contract Service Abstraction
// Interfaces React components with Midnight Compact Smart Contract functions

import { lockboxSimulator } from '@contract/lockbox-simulator';
import {
  PublicLedgerState,
  MedicalPayload,
  ResponderKeyInfo,
  AccessLogEntry,
  ZkProofResult
} from '@contract/types';

export interface QrCodePayload {
  contractAddress: string;
  recordCommitment: string;
  patientInitials: string;
  version: string;
}

// Load real contract address from deployment.json if it exists (written by deploy script)
// Falls back to simulator placeholder when running locally without a real deployment.
function loadContractAddress(): string {
  try {
    // Vite exposes JSON imports via ?url; in production build this is inlined
    // We use a simple localStorage override as the runtime bridge from the deploy script
    const stored = typeof localStorage !== 'undefined'
      ? localStorage.getItem('medilock_contract_address')
      : null;
    if (stored) return stored;
  } catch { /* ignore */ }
  // Default Midnight Preprod Address
  return '0xe2763880291d490ab466554a3b2446a5a8b4fefa10998c72871e9257dc8d180c';
}

export class LockboxService {
  // Contract address: set by deploy script via CONTRACT_ADDRESS env var or localStorage
  private readonly contractAddress: string = loadContractAddress();

  public getContractAddress(): string {
    return this.contractAddress;
  }

  public getPublicLedgerState(): PublicLedgerState {
    return lockboxSimulator.getPublicLedger();
  }

  public getShieldedMedicalPayload(): MedicalPayload | null {
    return lockboxSimulator.getShieldedPayload();
  }

  public getAuthorizedResponders(): ResponderKeyInfo[] {
    return lockboxSimulator.getAuthorizedResponders();
  }

  public getAccessLogs(): AccessLogEntry[] {
    return lockboxSimulator.getAccessLogs();
  }

  public async registerMedicalRecord(
    ownerSecretKeyHex: string,
    payload: MedicalPayload
  ): Promise<{ ledgerState: PublicLedgerState; zkProof: ZkProofResult }> {
    return lockboxSimulator.registerCircuit(ownerSecretKeyHex, payload);
  }

  public async authorizeResponder(
    responderName: string,
    responderSkHex: string
  ): Promise<{ responderInfo: ResponderKeyInfo; zkProof: ZkProofResult }> {
    return lockboxSimulator.authorizeResponderCircuit(responderName, responderSkHex);
  }

  public async revokeResponder(responderKeyHash: string): Promise<ZkProofResult> {
    return lockboxSimulator.revokeResponderCircuit(responderKeyHash);
  }

  public async requestAccess(responderSkHex: string) {
    return lockboxSimulator.requestAccessCircuit(responderSkHex);
  }

  public async revokeRecord(): Promise<ZkProofResult> {
    return lockboxSimulator.revokeRecordCircuit();
  }

  /**
   * Encodes contract & commitment data into a compact QR payload
   */
  public generateQrPayload(): string {
    const ledger = this.getPublicLedgerState();
    const payload = this.getShieldedMedicalPayload();
    const initials = payload
      ? payload.fullName.split(' ').map(n => n[0]).join('')
      : 'EM';

    const qrData: QrCodePayload = {
      contractAddress: this.contractAddress,
      recordCommitment: ledger.recordCommitment,
      patientInitials: initials,
      version: 'v1.0-midnight',
    };

    return JSON.stringify(qrData);
  }

  /**
   * Decodes scanned QR payload
   */
  public parseQrPayload(rawStr: string): QrCodePayload | null {
    try {
      const parsed = JSON.parse(rawStr) as QrCodePayload;
      if (parsed.contractAddress && parsed.recordCommitment) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const lockboxService = new LockboxService();
