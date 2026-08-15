/**
 * Midnight Provider & Lace Wallet Integration Service
 * Handles window.midnight.mnLace connector, local proof server (localhost:6300),
 * and Testnet vs Undeployed network switching.
 */

export interface MidnightNetworkConfig {
  network: 'testnet' | 'undeployed';
  proofServerUri: string;
  indexerUri: string;
  nodeUri: string;
}

export interface LaceWalletState {
  isConnected: boolean;
  walletAddress?: string;
  network?: string;
  error?: string;
}

class MidnightProviderService {
  private config: MidnightNetworkConfig;
  private walletState: LaceWalletState = { isConnected: false };

  constructor() {
    const isUndeployed = import.meta.env.VITE_MIDNIGHT_NETWORK === 'undeployed';
    this.config = {
      network: isUndeployed ? 'undeployed' : 'testnet',
      proofServerUri: import.meta.env.VITE_PROOF_SERVER_URI || 'http://localhost:6300',
      indexerUri: isUndeployed
        ? 'http://localhost:8088/api/v1/graphql'
        : 'https://indexer.testnet.midnight.network/api/v1/graphql',
      nodeUri: isUndeployed
        ? 'http://localhost:9944'
        : 'https://rpc.testnet.midnight.network',
    };
  }

  public getConfig(): MidnightNetworkConfig {
    return { ...this.config };
  }

  public getWalletState(): LaceWalletState {
    return { ...this.walletState };
  }

  /**
   * Connects to the Lace Midnight Preview Browser Wallet
   */
  public async connectLaceWallet(): Promise<LaceWalletState> {
    try {
      const win = window as any;
      const laceConnector =
        win.midnight?.mnLace ||
        win.midnight?.lace ||
        win.midnight?.midnight ||
        win.mnLace ||
        win.cardano?.lace;

      if (!laceConnector) {
        const errorMsg =
          'Midnight Lace Wallet Extension not detected!\n\n' +
          'Please ensure:\n' +
          '1. The Midnight Lace extension is installed in Google Chrome.\n' +
          '2. Developer mode / extension permissions allow access to localhost:3001.\n' +
          '3. Refresh the page after enabling Lace.';

        console.warn(errorMsg);
        alert(errorMsg);

        this.walletState = {
          isConnected: false,
          error: 'Lace extension not installed',
        };
        return this.walletState;
      }

      // Invoke the official Lace enable() method to trigger the Chrome popup window
      const wallet = await laceConnector.enable();

      let stateAddress = 'mn_lace_active_account';
      let network = this.config.network;

      try {
        if (wallet && typeof wallet.state === 'function') {
          const st = await wallet.state();
          stateAddress = st?.address || stateAddress;
        } else if (wallet && wallet.state && typeof wallet.state === 'object') {
          stateAddress = wallet.state.address || stateAddress;
        } else if (wallet && wallet.address) {
          stateAddress = wallet.address;
        }
      } catch (stErr) {
        console.warn('Could not read wallet.state(), using active connection:', stErr);
      }

      try {
        if (wallet && typeof wallet.serviceUriConfig === 'function') {
          const uris = await wallet.serviceUriConfig();
          if (uris?.network) network = uris.network;
          if (uris?.proofServerUri) this.config.proofServerUri = uris.proofServerUri;
          if (uris?.indexerUri) this.config.indexerUri = uris.indexerUri;
          if (uris?.nodeUri) this.config.nodeUri = uris.nodeUri;
        }
      } catch (uriErr) {
        console.warn('Could not read serviceUriConfig(), using defaults:', uriErr);
      }

      this.walletState = {
        isConnected: true,
        walletAddress: stateAddress,
        network: network,
      };

      return this.walletState;
    } catch (err: any) {
      alert(`Lace Wallet Error: ${err.message || 'Connection request denied or cancelled.'}`);
      this.walletState = {
        isConnected: false,
        error: err.message || 'Failed to connect to Lace Midnight wallet',
      };
      return this.walletState;
    }
  }

  /**
   * Disconnects the Lace Wallet session
   */
  public disconnectLaceWallet(): LaceWalletState {
    this.walletState = { isConnected: false };
    return this.walletState;
  }

  /**
   * Evaluates if local Proof Server is reachable at localhost:6300
   */
  public async checkProofServerHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.config.proofServerUri}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const midnightProvider = new MidnightProviderService();
