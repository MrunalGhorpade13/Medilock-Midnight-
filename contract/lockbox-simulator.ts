// Midnight Compact Contract Simulator Engine
// Blank initial state for user testing

import {
  PublicLedgerState,
  MedicalPayload,
  ResponderKeyInfo,
  AccessLogEntry,
  ZkProofResult
} from './types';
import {
  persistentHash,
  persistentCommit,
  generateRandomBytes32,
  encryptPayload,
  decryptPayload
} from './crypto-utils';

class CompactLockboxSimulator {
  // Public On-Chain Ledger State (Starts EMPTY)
  private ledgerState: PublicLedgerState = {
    ownerCommitment: '',
    recordCommitment: '',
    state: 'EMPTY',
    accessCount: 0,
    round: 0,
    authorizedKeysCount: 0,
    authorizedKeyHashes: [],
  };

  // Local Wallet Shielded Storage (Off-chain private state)
  private ownerSecretKey: string = '0x_patient_sk_9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c';
  private commitRandomness: string = '';
  private shieldedPayload: MedicalPayload | null = null;
  private encryptedPayloadBlob: string = '';
  private authorizedRespondersMap: Map<string, ResponderKeyInfo> = new Map();
  private accessLogs: AccessLogEntry[] = [];

  constructor() {
    // Blank slate initial state for fresh testing
  }

  // ==========================================================================
  // GETTERS
  // ==========================================================================

  public getPublicLedger(): PublicLedgerState {
    return { ...this.ledgerState, authorizedKeyHashes: [...this.ledgerState.authorizedKeyHashes] };
  }

  public getShieldedPayload(): MedicalPayload | null {
    return this.shieldedPayload;
  }

  public getAuthorizedResponders(): ResponderKeyInfo[] {
    return Array.from(this.authorizedRespondersMap.values());
  }

  public getAccessLogs(): AccessLogEntry[] {
    return [...this.accessLogs].sort((a, b) => b.timestamp - a.timestamp);
  }

  public getOwnerSecretKey(): string {
    return this.ownerSecretKey;
  }

  // ==========================================================================
  // COMPACT CIRCUITS
  // ==========================================================================

  /**
   * Circuit: register()
   * Patient registers or updates shielded medical payload.
   */
  public async registerCircuit(
    ownerSecretKeyHex: string,
    payload: MedicalPayload
  ): Promise<{ ledgerState: PublicLedgerState; zkProof: ZkProofResult }> {
    this.ownerSecretKey = ownerSecretKeyHex;
    this.commitRandomness = generateRandomBytes32();
    this.shieldedPayload = { ...payload, lastUpdatedTimestamp: Date.now() };

    // Compute ZK Witness commitments
    const ownerPk = await persistentHash('lockbox:owner:pk', this.ledgerState.round, ownerSecretKeyHex);
    const payloadStr = JSON.stringify(this.shieldedPayload);
    const commitment = await persistentCommit(payloadStr, this.commitRandomness);

    // Update off-chain payload encryption blob
    const sharedSecretKey = ownerPk + commitment;
    this.encryptedPayloadBlob = await encryptPayload(this.shieldedPayload, sharedSecretKey);

    // Execute Ledger State Transition
    this.ledgerState.ownerCommitment = ownerPk;
    this.ledgerState.recordCommitment = commitment;
    this.ledgerState.state = 'ACTIVE';

    // Auto-authorize default responder key if no responder key exists yet for easy instant responder testing
    if (this.ledgerState.authorizedKeyHashes.length === 0) {
      const demoResponderSk = '0x_paramedic_sk_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d';
      const demoResponderPkHash = await persistentHash('lockbox:responder:pk', this.ledgerState.round, demoResponderSk);
      const demoResponderInfo: ResponderKeyInfo = {
        id: 'resp-st-jude-101',
        name: 'St. Jude General Hospital — Emergency Dept',
        publicKeyHex: '0x_responder_pk_998877665544332211',
        keyHash: demoResponderPkHash,
        addedTimestamp: Date.now(),
      };
      this.authorizedRespondersMap.set(demoResponderPkHash, demoResponderInfo);
      this.ledgerState.authorizedKeyHashes.push(demoResponderPkHash);
      this.ledgerState.authorizedKeysCount = 1;
    }

    const zkProof: ZkProofResult = {
      proofId: `proof_reg_${Date.now().toString(16)}`,
      verified: true,
      circuitName: 'register()',
      timestamp: Date.now(),
      publicInputs: {
        recordCommitment: commitment,
        accessCount: this.ledgerState.accessCount,
        state: 'ACTIVE',
      },
      proofHash: await persistentHash('proof:register', Date.now(), ownerPk),
    };

    return { ledgerState: this.getPublicLedger(), zkProof };
  }

  /**
   * Circuit: authorizeResponder(responderPkHex)
   */
  public async authorizeResponderCircuit(
    responderName: string,
    responderSkHex: string
  ): Promise<{ responderInfo: ResponderKeyInfo; zkProof: ZkProofResult }> {
    if (this.ledgerState.state !== 'ACTIVE') {
      throw new Error("Contract assertion failed: Record is not ACTIVE. Register your record first.");
    }

    const responderKeyHash = await persistentHash(
      'lockbox:responder:pk',
      this.ledgerState.round,
      responderSkHex
    );

    const responderInfo: ResponderKeyInfo = {
      id: `resp_${Date.now().toString(16)}`,
      name: responderName,
      publicKeyHex: `0x_pk_${responderSkHex.slice(0, 16)}`,
      keyHash: responderKeyHash,
      addedTimestamp: Date.now(),
    };

    this.authorizedRespondersMap.set(responderKeyHash, responderInfo);

    if (!this.ledgerState.authorizedKeyHashes.includes(responderKeyHash)) {
      this.ledgerState.authorizedKeyHashes.push(responderKeyHash);
      this.ledgerState.authorizedKeysCount = this.ledgerState.authorizedKeyHashes.length;
    }

    const zkProof: ZkProofResult = {
      proofId: `proof_auth_${Date.now().toString(16)}`,
      verified: true,
      circuitName: 'authorizeResponder()',
      timestamp: Date.now(),
      publicInputs: {
        recordCommitment: this.ledgerState.recordCommitment,
        accessCount: this.ledgerState.accessCount,
        state: this.ledgerState.state,
      },
      proofHash: await persistentHash('proof:authorize', Date.now(), responderKeyHash),
    };

    return { responderInfo, zkProof };
  }

  /**
   * Circuit: revokeResponder(responderKeyHash)
   */
  public async revokeResponderCircuit(responderKeyHash: string): Promise<ZkProofResult> {
    this.authorizedRespondersMap.delete(responderKeyHash);
    this.ledgerState.authorizedKeyHashes = this.ledgerState.authorizedKeyHashes.filter(
      hash => hash !== responderKeyHash
    );
    this.ledgerState.authorizedKeysCount = this.ledgerState.authorizedKeyHashes.length;

    return {
      proofId: `proof_revoke_${Date.now().toString(16)}`,
      verified: true,
      circuitName: 'revokeResponder()',
      timestamp: Date.now(),
      publicInputs: {
        recordCommitment: this.ledgerState.recordCommitment,
        accessCount: this.ledgerState.accessCount,
        state: this.ledgerState.state,
      },
      proofHash: await persistentHash('proof:revokeResponder', Date.now(), responderKeyHash),
    };
  }

  /**
   * Circuit: requestAccess()
   */
  public async requestAccessCircuit(
    responderSecretKeyHex: string
  ): Promise<{
    success: boolean;
    payload?: MedicalPayload;
    zkProof: ZkProofResult;
    errorReason?: string;
  }> {
    const timestamp = Date.now();

    if (this.ledgerState.state !== 'ACTIVE') {
      const failedLog: AccessLogEntry = {
        id: `log_${timestamp}`,
        timestamp,
        accessCountNumber: this.ledgerState.accessCount,
        verifiedZkProof: false,
        anonymousResponderHash: 'zk_failed_record_inactive',
        status: 'FAILED_REVOKED',
      };
      this.accessLogs.push(failedLog);

      return {
        success: false,
        errorReason: 'Record is EMPTY or REVOKED. Patient must register a record first.',
        zkProof: {
          proofId: `proof_err_${timestamp}`,
          verified: false,
          circuitName: 'requestAccess()',
          timestamp,
          publicInputs: {
            recordCommitment: this.ledgerState.recordCommitment,
            accessCount: this.ledgerState.accessCount,
            state: this.ledgerState.state,
          },
          proofHash: '0x0000000000000000',
        },
      };
    }

    const derivedKeyHash = await persistentHash(
      'lockbox:responder:pk',
      this.ledgerState.round,
      responderSecretKeyHex
    );

    const isAuthorized = this.ledgerState.authorizedKeyHashes.includes(derivedKeyHash);

    if (!isAuthorized) {
      const failedLog: AccessLogEntry = {
        id: `log_${timestamp}`,
        timestamp,
        accessCountNumber: this.ledgerState.accessCount,
        verifiedZkProof: false,
        anonymousResponderHash: 'zk_rejected_unauthorized_key',
        status: 'FAILED_UNAUTHORIZED',
      };
      this.accessLogs.push(failedLog);

      return {
        success: false,
        errorReason: 'Zero-Knowledge Assertion Failed: Responder key is not authorized in authorizedKeys set.',
        zkProof: {
          proofId: `proof_fail_${timestamp}`,
          verified: false,
          circuitName: 'requestAccess()',
          timestamp,
          publicInputs: {
            recordCommitment: this.ledgerState.recordCommitment,
            accessCount: this.ledgerState.accessCount,
            state: this.ledgerState.state,
          },
          proofHash: '0x_invalid_zk_membership_proof',
        },
      };
    }

    this.ledgerState.accessCount += 1;

    const sharedSecretKey = this.ledgerState.ownerCommitment + this.ledgerState.recordCommitment;
    const decryptedMedicalData = await decryptPayload<MedicalPayload>(
      this.encryptedPayloadBlob,
      sharedSecretKey
    );

    const anonymousZkTag = await persistentHash('zk:membership:proof', timestamp, derivedKeyHash);

    const successLog: AccessLogEntry = {
      id: `log_${timestamp}`,
      timestamp,
      accessCountNumber: this.ledgerState.accessCount,
      verifiedZkProof: true,
      anonymousResponderHash: `${anonymousZkTag.slice(0, 10)}...${anonymousZkTag.slice(-6)}`,
      status: 'SUCCESS_DECRYPTED',
    };
    this.accessLogs.push(successLog);

    const zkProof: ZkProofResult = {
      proofId: `proof_access_${timestamp.toString(16)}`,
      verified: true,
      circuitName: 'requestAccess()',
      timestamp,
      publicInputs: {
        recordCommitment: this.ledgerState.recordCommitment,
        accessCount: this.ledgerState.accessCount,
        state: 'ACTIVE',
      },
      proofHash: anonymousZkTag,
    };

    return {
      success: true,
      payload: decryptedMedicalData,
      zkProof,
    };
  }

  /**
   * Circuit: revokeRecord()
   */
  public async revokeRecordCircuit(): Promise<ZkProofResult> {
    this.ledgerState.state = 'REVOKED';
    this.ledgerState.round += 1;

    const zkProof: ZkProofResult = {
      proofId: `proof_kill_${Date.now().toString(16)}`,
      verified: true,
      circuitName: 'revokeRecord()',
      timestamp: Date.now(),
      publicInputs: {
        recordCommitment: this.ledgerState.recordCommitment,
        accessCount: this.ledgerState.accessCount,
        state: 'REVOKED',
      },
      proofHash: await persistentHash('proof:revokeRecord', Date.now(), this.ownerSecretKey),
    };

    return zkProof;
  }
}

export const lockboxSimulator = new CompactLockboxSimulator();
