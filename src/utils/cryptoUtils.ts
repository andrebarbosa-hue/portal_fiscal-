// Utilitário de criptografia SHA-256 com Salt usando Web Crypto API nativa do navegador
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(length = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  return sha256(`${salt}:${password.trim()}:portal_fiscal_key`);
}

export async function hashPasswordWithLegacySalt(password: string, salt: string): Promise<string> {
  return sha256(`${salt}:${password.trim()}:ats_portal_fiscal_key`);
}
