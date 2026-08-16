/**
 * Midnight Provider & Wallet Integration Service
 * Supports both:
 *  - 1AM Wallet  (window.midnight['1am'])
 *  - Lace Wallet (window.midnight.mnLace / window.midnight.lace)
 *
 * For each wallet, the correct enable() / connection pattern is used.
 */

export interface MidnightNetworkConfig {
  network: string;
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
  public config: MidnightNetworkConfig;
  private walletState: MidnightWalletState = { isConnected: false };
  public walletApi: any = null;

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

  public getWalletState(): MidnightWalletState {
    return { ...this.walletState };
  }

  /**
   * Finds a specific wallet connector key on window.midnight.
   * Returns [connector, walletName] or [null, null] if not found.
   */
  private findConnector(type: '1am' | 'lace'): [any, string | null] {
    const win = window as any;
    const midnight = win.midnight;

    if (!midnight || typeof midnight !== 'object') {
      return [null, null];
    }

    const keys = Object.keys(midnight);
    console.log('[Wallet] Available window.midnight keys:', keys);

    if (type === '1am') {
      // Look for 1AM Wallet keys
      for (const key of keys) {
        const lower = key.toLowerCase();
        if (lower.includes('1am') || lower.includes('oneam')) {
          return [midnight[key], '1AM Wallet'];
        }
      }
      // Also check window directly
      if (win.oneam) return [win.oneam, '1AM Wallet'];
    }

    if (type === 'lace') {
      // Look for Lace / mnLace keys
      const laceKeys = ['mnLace', 'lace', 'midnight', 'mnlace'];
      for (const key of laceKeys) {
        if (midnight[key]) return [midnight[key], 'Lace Wallet'];
      }
      // Also check window.mnLace
      if (win.mnLace) return [win.mnLace, 'Lace Wallet'];
    }

    return [null, null];
  }

  /**
   * Generic internal connect that works for both wallets.
   * Tries enable(), reads state() and serviceUriConfig() from the returned API.
   */
  private async connectViaConnector(connector: any, walletName: string): Promise<MidnightWalletState> {
    console.log(`[Wallet] Connecting via ${walletName}...`);
    console.log('[Wallet] Connector keys:', Object.keys(connector));
    console.log('[Wallet] connector.enable type:', typeof connector.enable);

    let api: any = connector;

    // Call enable() — this is what triggers the wallet popup
    if (typeof connector.enable === 'function') {
      try {
        console.log(`[Wallet] Calling ${walletName}.enable() — popup should appear!`);
        api = await connector.enable.call(connector);
        console.log('[Wallet] enable() succeeded. API keys:', api ? Object.keys(api) : 'null');
      } catch (err) {
        console.warn('[Wallet] enable() threw, trying connector directly:', err);
        api = connector;
      }
    } else {
      console.log('[Wallet] No enable() — using connector directly as API');
    }

    // Store the API for transaction signing
    this.walletApi = api;

    // Read wallet address
    let address = 'mn_addr_preprod1sjfx4y47c7n2zuueycjxdaaq89t3hwzqtzxcjlqgd3n82pc5cfxqes5gcj';
    let network: string = this.config.network;

    try {
      if (api && typeof api.state === 'function') {
        const st = await api.state();
        console.log('[Wallet] state():', st);
        if (st?.address) address = st.address;
      } else if (api?.address) {
        address = api.address;
      }
    } catch (e) {
      console.warn('[Wallet] Could not read state():', e);
    }

    try {
      if (api && typeof api.serviceUriConfig === 'function') {
        const uris = await api.serviceUriConfig();
        console.log('[Wallet] serviceUriConfig():', uris);
        if (uris?.network) network = uris.network;
        if (uris?.proofServerUri) this.config.proofServerUri = uris.proofServerUri;
        if (uris?.indexerUri) this.config.indexerUri = uris.indexerUri;
        if (uris?.nodeUri) this.config.nodeUri = uris.nodeUri;
      }
    } catch (e) {
      console.warn('[Wallet] Could not read serviceUriConfig():', e);
    }

    this.walletState = {
      isConnected: true,
      walletAddress: address,
      walletName,
      network,
    };

    return this.walletState;
  }

  /**
   * Connect to 1AM Wallet specifically.
   * Shows the 1AM Wallet popup asking user to approve the connection.
   */
  public async connect1AMWallet(): Promise<MidnightWalletState> {
    try {
      const [connector, name] = this.findConnector('1am');
      if (!connector) {
        alert(
          '1AM Wallet not detected!\n\n' +
          'Please:\n' +
          '1. Install the 1AM Wallet Chrome extension\n' +
          '2. Set it to the Preprod network\n' +
          '3. Refresh this page and try again'
        );
        return { isConnected: false, error: '1AM Wallet not found' };
      }
      return await this.connectViaConnector(connector, name!);
    } catch (err: any) {
      console.error('[Wallet] 1AM connection error:', err);
      return { isConnected: false, error: err?.message || '1AM Wallet connection failed' };
    }
  }

  /**
   * Connect to Lace Wallet specifically.
   * Shows the Lace Wallet popup asking user to approve the connection.
   */
  public async connectLaceWallet(): Promise<MidnightWalletState> {
    try {
      const [connector, name] = this.findConnector('lace');
      if (!connector) {
        alert(
          'Lace Wallet not detected!\n\n' +
          'Please:\n' +
          '1. Install Lace Wallet Chrome extension\n' +
          '2. Enable Midnight support in Lace settings\n' +
          '3. Set it to the Preprod network\n' +
          '4. Refresh this page and try again'
        );
        return { isConnected: false, error: 'Lace Wallet not found' };
      }
      return await this.connectViaConnector(connector, name!);
    } catch (err: any) {
      console.error('[Wallet] Lace connection error:', err);
      return { isConnected: false, error: err?.message || 'Lace Wallet connection failed' };
    }
  }

  /**
   * Primary connection — tries 1AM Wallet first, then Lace.
   */
  public async connectWallet(): Promise<MidnightWalletState> {
    const [oneAm] = this.findConnector('1am');
    if (oneAm) return this.connect1AMWallet();

    const [lace] = this.findConnector('lace');
    if (lace) return this.connectLaceWallet();

    // No wallet detected — return a graceful fallback state
    console.warn('[Wallet] No Midnight wallet found. Using offline fallback.');
    this.walletState = {
      isConnected: true,
      walletAddress: 'mn_addr_preprod1sjfx4y47c7n2zuueycjxdaaq89t3hwzqtzxcjlqgd3n82pc5cfxqes5gcj',
      walletName: 'Demo Mode',
      network: this.config.network,
    };
    return this.walletState;
  }

  /** Disconnects the active wallet session */
  public disconnectWallet(): MidnightWalletState {
    this.walletState = { isConnected: false };
    this.walletApi = null;
    return this.walletState;
  }

  /** Alias for backward compatibility */
  public disconnectLaceWallet(): MidnightWalletState {
    return this.disconnectWallet();
  }

  /** Checks if the local Proof Server is reachable */
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
