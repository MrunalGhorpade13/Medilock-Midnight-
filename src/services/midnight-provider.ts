/**
 * Midnight Provider & Wallet Integration Service
 * Supports 1AM Wallet (primary) and Lace Wallet (fallback)
 * Uses the Midnight DApp Connector protocol to trigger the wallet popup.
 */

export interface MidnightNetworkConfig {
  network: 'testnet' | 'undeployed';
  proofServerUri: string;
  indexerUri: string;
  nodeUri: string;
}

export interface MidnightWalletState {
  isConnected: boolean;
  walletAddress?: string;
  network?: string;
  walletName?: string;
  error?: string;
}

export type LaceWalletState = MidnightWalletState;

class MidnightProviderService {
  private config: MidnightNetworkConfig;
  private walletState: MidnightWalletState = { isConnected: false };
  private walletApi: any = null; // Holds the API returned by enable()

  constructor() {
    this.config = {
      network: 'testnet',
      proofServerUri: import.meta.env.VITE_PROOF_SERVER_URI || 'http://localhost:6300',
      indexerUri: 'https://indexer.preprod.midnight.network/api/v1/graphql',
      nodeUri: 'https://rpc.preprod.midnight.network',
    };
  }

  public getConfig(): MidnightNetworkConfig {
    return { ...this.config };
  }

  public getWalletState(): LaceWalletState {
    return { ...this.walletState };
  }

  public getWalletApi(): any {
    return this.walletApi;
  }

  /**
   * Connects to the 1AM Wallet and triggers the extension approval popup.
   * The Midnight DApp Connector protocol requires calling connector.enable()
   * which opens the 1AM Wallet extension window asking user for permission.
   */
  public async connectLaceWallet(): Promise<LaceWalletState> {
    const win = window as any;

    // Step 1: Find the 1AM Wallet connector on window.midnight
    let connector: any = null;
    let walletName = '1AM Wallet';

    // Try all known 1AM Wallet keys
    const oneAmKeys = ['1am', '1AM', 'oneam', 'oneAm', 'mnOneAm'];
    if (win.midnight && typeof win.midnight === 'object') {
      // Log all available keys for debugging
      const availableKeys = Object.keys(win.midnight);
      console.log('[MediLock] window.midnight keys:', availableKeys);

      for (const key of availableKeys) {
        if (oneAmKeys.some(k => key.toLowerCase() === k.toLowerCase())) {
          connector = win.midnight[key];
          console.log(`[MediLock] Found 1AM Wallet at window.midnight['${key}']`);
          break;
        }
      }

      // If not found by name, take the first connector available
      if (!connector && availableKeys.length > 0) {
        const firstKey = availableKeys[0];
        connector = win.midnight[firstKey];
        walletName = firstKey;
        console.log(`[MediLock] Using first available wallet: window.midnight['${firstKey}']`);
      }
    }

    // Fallback: Lace-style connectors
    if (!connector) {
      connector = win.midnight?.mnLace || win.midnight?.lace || win.mnLace;
      if (connector) walletName = 'Lace Wallet';
    }

    if (!connector) {
      console.warn('[MediLock] No Midnight wallet extension found on window.midnight');
      alert(
        '1AM Wallet not detected!\n\n' +
        'Please:\n' +
        '1. Install the 1AM Wallet Chrome extension\n' +
        '2. Set it to Preprod network\n' +
        '3. Refresh this page'
      );
      return { isConnected: false, error: 'Wallet not found' };
    }

    // Step 2: Log all available methods on the connector
    console.log('[MediLock] Connector methods:', Object.keys(connector));
    console.log('[MediLock] Connector type:', typeof connector);
    console.log('[MediLock] connector.enable type:', typeof connector.enable);
    console.log('[MediLock] connector.isEnabled type:', typeof connector.isEnabled);

    try {
      let api: any = null;

      // Step 3: Check if already enabled
      if (typeof connector.isEnabled === 'function') {
        const already = await connector.isEnabled();
        console.log('[MediLock] isEnabled():', already);
      }

      // Step 4: Call enable() — this MUST trigger the 1AM Wallet popup
      // Bind to connector to preserve 'this' context inside the extension
      if (typeof connector.enable === 'function') {
        console.log('[MediLock] Calling connector.enable() to trigger wallet popup...');
        api = await connector.enable.call(connector);
        console.log('[MediLock] enable() returned:', api);
        console.log('[MediLock] API methods:', api ? Object.keys(api) : 'null');
        this.walletApi = api;
      } else {
        // Connector itself is the API (some wallet implementations)
        console.log('[MediLock] No enable() found — using connector as API directly');
        api = connector;
        this.walletApi = api;
      }

      // Step 5: Read wallet address
      let stateAddress = 'mn_addr_preprod1sjfx4y47c7n2zuueycjxdaaq89t3hwzqtzxcjlqgd3n82pc5cfxqes5gcj';
      let network: string = this.config.network;

      if (api) {
        try {
          if (typeof api.state === 'function') {
            const st = await api.state();
            console.log('[MediLock] wallet.state():', st);
            if (st?.address) stateAddress = st.address;
          } else if (api.address) {
            stateAddress = api.address;
          }
        } catch (e) {
          console.warn('[MediLock] Could not read state():', e);
        }

        try {
          if (typeof api.serviceUriConfig === 'function') {
            const uris = await api.serviceUriConfig();
            console.log('[MediLock] serviceUriConfig():', uris);
            if (uris?.network) network = uris.network;
            if (uris?.proofServerUri) this.config.proofServerUri = uris.proofServerUri;
            if (uris?.indexerUri) this.config.indexerUri = uris.indexerUri;
            if (uris?.nodeUri) this.config.nodeUri = uris.nodeUri;
          }
        } catch (e) {
          console.warn('[MediLock] Could not read serviceUriConfig():', e);
        }
      }

      this.walletState = {
        isConnected: true,
        walletAddress: stateAddress,
        walletName,
        network,
      };

      return this.walletState;

    } catch (err: any) {
      console.error('[MediLock] Wallet connection error:', err);
      return {
        isConnected: false,
        error: err?.message || 'Connection failed',
      };
    }
  }

  /** Primary connection method */
  public async connectWallet(): Promise<MidnightWalletState> {
    return this.connectLaceWallet();
  }

  /** Disconnects the wallet session */
  public disconnectWallet(): MidnightWalletState {
    this.walletState = { isConnected: false };
    this.walletApi = null;
    return this.walletState;
  }

  /** Backward compatible alias */
  public disconnectLaceWallet(): MidnightWalletState {
    return this.disconnectWallet();
  }

  /** Checks if local Proof Server is reachable */
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
