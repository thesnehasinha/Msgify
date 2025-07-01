import CryptoJS from 'crypto-js';

// Simple key derivation from sender and receiver UIDs (deterministic)
export function generateChatKey(senderUID, receiverUID) {
  const sorted = [senderUID, receiverUID].sort().join('-');
  return CryptoJS.SHA256(sorted).toString(); // 256-bit AES key
}

export function encryptMessage(message, key) {
  return CryptoJS.AES.encrypt(message, key).toString();
}

export function decryptMessage(ciphertext, key) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}
