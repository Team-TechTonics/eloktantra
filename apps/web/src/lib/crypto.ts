import crypto from 'crypto';

// "CYBERSECURITY SHIELD" VAULT CRYPTO 🛡️🔐🕵️‍♂️
// Implements mandatory AES-256 Bit Encryption for PII (Aadhaar/Identity)
// Satisfies Roadmap Section 3: Legal & Regulatory Data Privacy

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from('8ldFgRXplJ3itScFF-VAULT-2024-KEY-32', 'utf-8').slice(0, 32); // 32-Char Derived Key
const IV_LENGTH = 16;

/**
 * Encrypts sensitive document content (Base64) before it hits the cloud.
 */
export function encryptVault(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts document content for authorized browser rendering.
 */
export function decryptVault(text: string) {
  const [ivHex, encryptedHex] = text.split(':');
  if (!ivHex || !encryptedHex) return text; // Not encrypted

  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/**
 * HASHING: PII Anonymization (Roadmap Section 2)
 * Creates a one-way deterministic hash of a Voter ID.
 */
export function anonymizeVoter(voterId: string) {
  return crypto.createHash('sha256').update(voterId).digest('hex');
}
