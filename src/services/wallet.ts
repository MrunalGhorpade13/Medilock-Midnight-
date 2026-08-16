// 1AM Wallet & Midnight DApp Connector API Stub & Wallet State Provider

export interface MidnightWalletAccount {
  address: string;
  name: string;
  network: 'Midnight Testnet' | 'Local Devnet Simulator';
  shieldedBalance: string;
  publicKeyHex: string;
  secretKeyHex: string;
  isResponderAuthorized?: boolean;
}

export type WalletRole = 'PATIENT' | 'RESPONDER_AUTHORIZED' | 'RESPONDER_UNAUTHORIZED';

let patientName: string = 'Patient Wallet';

class MidnightWalletService {
  private isConnected: boolean = true;
  private currentRole: WalletRole = 'PATIENT';

  public updatePatientName(name: string) {
    if (name.trim()) {
      patientName = name.trim();
    }
  }

  public getPatientName(): string {
    return patientName;
  }

  public isWalletConnected(): boolean {
    return this.isConnected;
  }

  public getActiveAccount(): MidnightWalletAccount {
    const patientWallet: MidnightWalletAccount = {
      address: 'mn_addr_preprod1sjfx4y47c7n2zuueycjxdaaq89t3hwzqtzxcjlqgd3n82pc5cfxqes5gcj',
      name: `${patientName} (1AM Wallet)`,
      network: 'Midnight Testnet',
      shieldedBalance: '5,000.00 tNIGHT (DUST Sponsored)',
      publicKeyHex: '0x_patient_pk_8877665544332211',
      secretKeyHex: '0x_patient_sk_9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c',
    };

    const authorizedResponderWallet: MidnightWalletAccount = {
      address: 'mn_t1_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
      name: 'St. Jude Emergency Dept (Authorized)',
      network: 'Midnight Testnet',
      shieldedBalance: '500.00 tDUST',
      publicKeyHex: '0x_responder_pk_998877665544332211',
      secretKeyHex: '0x_paramedic_sk_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
      isResponderAuthorized: true,
    };

    const unauthorizedResponderWallet: MidnightWalletAccount = {
      address: 'mn_t1_7766554433221100aabbccddeeff00112233',
      name: 'Unverified Third-Party (Unauthorized)',
      network: 'Midnight Testnet',
      shieldedBalance: '50.00 tDUST',
      publicKeyHex: '0x_unauth_pk_1122334455667788',
      secretKeyHex: '0x_unauth_sk_9900aabbccddeeff1122334455667788',
      isResponderAuthorized: false,
    };

    switch (this.currentRole) {
      case 'PATIENT':
        return patientWallet;
      case 'RESPONDER_AUTHORIZED':
        return authorizedResponderWallet;
      case 'RESPONDER_UNAUTHORIZED':
        return unauthorizedResponderWallet;
      default:
        return patientWallet;
    }
  }

  public setWalletRole(role: WalletRole) {
    this.currentRole = role;
  }

  public getWalletRole(): WalletRole {
    return this.currentRole;
  }
}

export const midnightWallet = new MidnightWalletService();
