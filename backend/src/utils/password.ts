import bcrypt from 'bcryptjs';
import { hash, verify, Algorithm } from '@node-rs/argon2';

const SALT_ROUNDS = 12;

/**
 * Hash password using Argon2id with recommended parameters.
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    algorithm: Algorithm.Argon2id,
    memoryCost: 19456, // 19 MiB
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

/**
 * Compare password against stored hash.
 * Supports Argon2id and gracefully falls back to bcrypt for existing seed/legacy accounts.
 */
export async function comparePassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash) return false;

  // Check if hash is Argon2 (starts with $argon2id or $argon2)
  if (storedHash.startsWith('$argon2')) {
    try {
      return await verify(storedHash, password);
    } catch {
      return false;
    }
  }

  // Fallback to bcrypt for legacy seeds ($2a$, $2b$, $2y$)
  if (storedHash.startsWith('$2')) {
    try {
      return await bcrypt.compare(password, storedHash);
    } catch {
      return false;
    }
  }

  return false;
}

