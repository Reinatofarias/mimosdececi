import { pbkdf2Sync, randomBytes } from 'node:crypto';

const password = process.argv[2];

if (!password) {
  console.error('Uso: node scripts/hash-password.mjs "sua-senha"');
  process.exit(1);
}

const iterations = 310000;
const salt = randomBytes(16).toString('base64url');
const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('base64url');

console.log(`pbkdf2$${iterations}$${salt}$${hash}`);
