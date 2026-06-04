import { pbkdf2Sync, timingSafeEqual } from 'crypto';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

declare module 'next-auth' {
  interface User {
    role?: string;
  }

  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
  }
}

export function createPasswordHash(password: string, salt: string, iterations = 310000) {
  const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('base64url');
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedValue?: string) {
  if (!storedValue) return false;

  if (!storedValue.startsWith('pbkdf2$')) {
    return password === storedValue;
  }

  const [, iterationsRaw, salt, expectedHash] = storedValue.split('$');
  const iterations = Number(iterationsRaw);
  if (!iterations || !salt || !expectedHash) return false;

  const actual = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  const expected = Buffer.from(expectedHash, 'base64url');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function isLoginLocked(identifier: string) {
  const attempt = loginAttempts.get(identifier);
  return Boolean(attempt && attempt.count >= MAX_LOGIN_ATTEMPTS && attempt.lockedUntil > Date.now());
}

function registerLoginFailure(identifier: string) {
  const current = loginAttempts.get(identifier);
  const activeWindow = current?.lockedUntil && current.lockedUntil > Date.now();
  const nextCount = (activeWindow ? current.count : 0) + 1;
  loginAttempts.set(identifier, {
    count: nextCount,
    lockedUntil: activeWindow ? current.lockedUntil : Date.now() + LOGIN_WINDOW_MS,
  });
}

function clearLoginFailures(identifier: string) {
  loginAttempts.delete(identifier);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        if (isLoginLocked(email)) {
          return null;
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD_HASH;

        if (
          email === adminEmail?.toLowerCase() &&
          verifyPassword(credentials.password, adminPassword)
        ) {
          clearLoginFailures(email);
          return {
            id: '1',
            name: 'Administrador Ceci',
            email: adminEmail,
            role: 'admin',
          };
        }

        registerLoginFailure(email);
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
