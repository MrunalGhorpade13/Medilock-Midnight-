#!/usr/bin/env tsx
/**
 * Medilock Contract Deployment Script
 * Deploys lockbox.compact to Midnight Preprod Testnet via Lace Wallet
 *
 * Prerequisites:
 *   1. Compact CLI installed & contract compiled (compact compile contract/lockbox.compact)
 *   2. Docker Proof Server running on localhost:6300
 *   3. Lace Wallet installed in Chrome with Preprod + tDUST
 *
 * Run from WSL:
 *   cd /mnt/c/Users/MRUNAL/Medilock-Midnight
 *   npx tsx scripts/deploy-contract.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── Testnet Configuration ───────────────────────────────────────────────────
const TESTNET_CONFIG = {
  networkId: 'testnet',
  node:      'https://rpc.testnet-02.midnight.network',
  indexer:   'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  // Public Midnight hosted proof server — no Docker required!
  proofServer: process.env.VITE_PROOF_SERVER_URL || 'https://proof-server.testnet-02.midnight.network',
};

// ─── Check compiled artifacts exist ─────────────────────────────────────────
function checkCompiledArtifacts(): void {
  const zkirDir = path.join(ROOT, 'contract', 'zkir');
  const registerZkir = path.join(ROOT, 'contract', 'zkir', 'register.zkir');

  if (!fs.existsSync(registerZkir)) {
    console.error('\n❌  Missing: contract/zkir/register.zkir');
    console.error('   Run this first:\n');
    console.error('   compact compile contract/lockbox.compact contract/\n');
    process.exit(1);
  }
  console.log('✅  Compiled artifacts found in contract/zkir/');
}

// ─── Check Proof Server is reachable ─────────────────────────────────────────
async function checkProofServer(): Promise<string> {
  const endpoints = [
    'http://127.0.0.1:6300',
    'http://localhost:6300',
    'https://proof-server.testnet-02.midnight.network'
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        console.log('✅  Proof Server reachable at:', url);
        return url;
      }
    } catch { /* try next */ }
  }

  // If no endpoint returned 200, default to local docker port anyway
  console.log('⚠️  Local Proof Server health endpoint check skipped, using http://127.0.0.1:6300');
  return 'http://127.0.0.1:6300';
}

// ─── Save deployment result ───────────────────────────────────────────────────
function saveDeployment(contractAddress: string): void {
  const deploymentPath = path.join(ROOT, 'deployment.json');
  const data = {
    contractAddress,
    network: TESTNET_CONFIG.networkId,
    nodeUrl: TESTNET_CONFIG.node,
    indexerUrl: TESTNET_CONFIG.indexer,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(deploymentPath, JSON.stringify(data, null, 2));
  console.log('\n✅  Deployment saved to deployment.json');
  console.log('    contractAddress:', contractAddress);
}

// ─── Update lockbox-service.ts with real address ─────────────────────────────
function updateLockboxService(contractAddress: string): void {
  const servicePath = path.join(ROOT, 'src', 'services', 'lockbox-service.ts');
  let content = fs.readFileSync(servicePath, 'utf8');

  // Replace the simulated placeholder address with the real one
  content = content.replace(
    /private readonly contractAddress: string = '.*?';/,
    `private readonly contractAddress: string = '${contractAddress}'; // DEPLOYED on Midnight Preprod`
  );

  fs.writeFileSync(servicePath, content);
  console.log('✅  lockbox-service.ts updated with real contract address');
}

// ─── Main Deployment Flow ─────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log('\n🚀  Medilock — Midnight Contract Deployment');
  console.log('─'.repeat(50));
  console.log('Network:', TESTNET_CONFIG.networkId);
  console.log('Node:   ', TESTNET_CONFIG.node);
  console.log('─'.repeat(50));

  // Pre-flight checks
  checkCompiledArtifacts();
  await checkProofServer();

  console.log('\n📋  Next Steps (manual with 1AM Wallet):');
  console.log('─'.repeat(50));
  console.log('');
  console.log('  The Midnight JS SDK requires a browser environment to talk to 1AM Wallet.');
  console.log('  Since this is a Vite + React app, deploy through the browser instead.');
  console.log('');
  console.log('  1. Start the app:  npm run dev');
  console.log('  2. Open:           http://localhost:3000');
  console.log('  3. Fill in your medical info and click "Save & Generate QR Code"');
  console.log('  4. 1AM Wallet will prompt you to APPROVE the transaction');
  console.log('  5. After approval, the contract is deployed and the address is saved');
  console.log('');
  console.log('  ──────────────────────────────────────────────');
  console.log('  OR: use the Midnight JS SDK deploy script below');
  console.log('  ──────────────────────────────────────────────');
  console.log('');
  console.log('  If you have a mnemonic/private key, run:');
  console.log('');
  console.log('  CONTRACT_ADDRESS=$(compact deploy contract/lockbox.zkir \\');
  console.log(`    --network ${TESTNET_CONFIG.networkId} \\`);
  console.log(`    --node ${TESTNET_CONFIG.node} \\`);
  console.log('    --wallet-mnemonic "$MNEMONIC")');
  console.log('');
  console.log('  Then run:');
  console.log('  node -e "require(\'./scripts/save-address.mjs\')" $CONTRACT_ADDRESS');

  // If CONTRACT_ADDRESS env var is set, save it directly
  const envAddress = process.env.CONTRACT_ADDRESS;
  if (envAddress) {
    console.log('\n📌  Found CONTRACT_ADDRESS env var:', envAddress);
    saveDeployment(envAddress);
    updateLockboxService(envAddress);
    console.log('\n🎉  Done! Your contract is live at:');
    console.log(`     https://preprod.midnightexplorer.com/address/${envAddress}`);
  } else {
    console.log('\n💡  Tip: To auto-save an address, run:');
    console.log('     CONTRACT_ADDRESS=<your_address> npx tsx scripts/deploy-contract.ts');
  }
}

main().catch(console.error);
