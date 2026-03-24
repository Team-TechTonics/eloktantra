/**
 * Web Crypto API based RSA-OAEP Decryption for Admin counting
 */

/**
 * Convert PKCS#8 Private Key PEM to ArrayBuffer
 */
function privatePemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binary = window.atob(b64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

/**
 * Decrypt a base64 ciphertext using the provided Private Key PEM
 */
export async function decryptVote(encryptedBase64: string, privateKeyPem: string): Promise<any> {
  try {
    const privateKeyBuffer = privatePemToArrayBuffer(privateKeyPem);
    const cryptoKey = await window.crypto.subtle.importKey(
      "pkcs8",
      privateKeyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["decrypt"]
    );

    const encryptedBuffer = new Uint8Array(
      window.atob(encryptedBase64).split("").map((c) => c.charCodeAt(0))
    );

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      cryptoKey,
      encryptedBuffer
    );

    const decodedData = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decodedData);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Could not decrypt vote. Check if the private key is correct.");
  }
}
