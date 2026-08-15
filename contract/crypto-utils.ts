// Cryptographic Utilities for Midnight Compact Simulator & Off-chain Transport
// Simulates persistentHash, persistentCommit, and AES-GCM off-chain key exchange

/**
 * SHA-256 string to 32-byte Hex representation
 */
export async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Simulates Midnight's persistentHash circuit operation:
 * persistentHash([domainPrefix, round, secretKey])
 */
export async function persistentHash(domainPrefix: string, round: number, secretKeyHex: string): Promise<string> {
  const input = `midnight:hash:${domainPrefix}:${round}:${secretKeyHex}`;
  return sha256Hex(input);
}

/**
 * Simulates Midnight's persistentCommit circuit operation:
 * persistentCommit(payload, randomness)
 */
export async function persistentCommit(payloadString: string, randomnessHex: string): Promise<string> {
  const input = `midnight:commit:${payloadString}:${randomnessHex}`;
  return sha256Hex(input);
}

/**
 * Generates a random 32-byte (64-char hex) string for nonces/keys
 */
export function generateRandomBytes32(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Off-Chain Encrypted Payload Transport
 * Encrypts sensitive medical payload JSON using a secret derived from the patient commitment key.
 */
export async function encryptPayload(payloadObj: object, encryptionKeyHex: string): Promise<string> {
  const textEncoder = new TextEncoder();
  const jsonStr = JSON.stringify(payloadObj);
  
  // Use Web Crypto SHA-256 to derive AES key bytes
  const keyHash = await crypto.subtle.digest('SHA-256', textEncoder.encode(encryptionKeyHex));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyHash,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    textEncoder.encode(jsonStr)
  );

  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts encrypted off-chain payload
 */
export async function decryptPayload<T>(encryptedBase64: string, encryptionKeyHex: string): Promise<T> {
  const binaryStr = atob(encryptedBase64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const iv = bytes.slice(0, 12);
  const dataBytes = bytes.slice(12);

  const textEncoder = new TextEncoder();
  const keyHash = await crypto.subtle.digest('SHA-256', textEncoder.encode(encryptionKeyHex));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyHash,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    dataBytes
  );

  const textDecoder = new TextDecoder();
  const jsonStr = textDecoder.decode(decryptedBuffer);
  return JSON.parse(jsonStr) as T;
}
