// Contract & Application Data Types for Emergency Medical Lockbox

export type RecordStateEnum = 'EMPTY' | 'ACTIVE' | 'REVOKED';

export interface MedicalPayload {
  fullName: string;
  dateOfBirth: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  organDonor: boolean;
  specialInstructions?: string;
  lastUpdatedTimestamp: number;
}

export interface PublicLedgerState {
  ownerCommitment: string;          // Bytes<32> hex
  recordCommitment: string;         // Bytes<32> hex
  state: RecordStateEnum;
  accessCount: number;
  round: number;
  authorizedKeysCount: number;
  authorizedKeyHashes: string[];    // Array of responder key hashes
}

export interface ResponderKeyInfo {
  id: string;
  name: string;                     // Human readable description (e.g. "St. Jude Hospital", "Metro Paramedic Squad #4")
  publicKeyHex: string;             // Raw public key bytes
  keyHash: string;                  // Derived persistentHash for ledger matching
  addedTimestamp: number;
}

export interface AccessLogEntry {
  id: string;
  timestamp: number;
  accessCountNumber: number;
  verifiedZkProof: boolean;
  anonymousResponderHash: string;   // Zero-knowledge proof output tag
  status: 'SUCCESS_DECRYPTED' | 'FAILED_UNAUTHORIZED' | 'FAILED_REVOKED';
}

export interface ZkProofResult {
  proofId: string;
  verified: boolean;
  circuitName: string;
  timestamp: number;
  publicInputs: {
    recordCommitment: string;
    accessCount: number;
    state: RecordStateEnum;
  };
  proofHash: string;
}

export type AppMode = 'PATIENT' | 'RESPONDER' | 'INSPECTOR';
