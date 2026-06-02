import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function isAdminSession() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

export async function requireAdminAction(): Promise<ActionResult | null> {
  const isAdmin = await isAdminSession();
  if (!isAdmin) {
    return { success: false, error: 'Não autorizado.' };
  }

  return null;
}
