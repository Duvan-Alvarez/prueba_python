import { v4 as uuidv4 } from 'uuid';

export function generateAccessToken(): string {
  return uuidv4();
}

export function generateSecureToken(): string {
  return uuidv4();
}

export function validateToken(token: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(token);
}
