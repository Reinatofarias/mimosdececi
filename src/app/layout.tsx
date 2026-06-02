import type { Metadata } from 'next';
import { Inter, Playfair_Display, Dancing_Script, Outfit } from 'next/font/google';
import './globals.css';
import { FloatingWhatsApp } from '@/components/ui/FloatingWhatsApp/FloatingWhatsApp';
import { GlobalBanner } from '@/components/layout/GlobalBanner';
import { getSettings } from '@/lib/dal/settings';
import { CartProvider } from '@/components/ui/Cart/CartProvider';
import { getSiteUrl } from '@/lib/site-url';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-accent',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'Mimos de Ceci | Presentes com Afeto',
  description: 'Cestas artesanais e mimos exclusivos feitos com carinho para momentos especiais.',
  openGraph: {
    title: 'Mimos de Ceci',
    description: 'Cestas artesanais e mimos exclusivos feitos com carinho para momentos especiais.',
    url: '/',
    siteName: 'Mimos de Ceci',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const globalBanner = {
    active: false,
    text: '',
    backgroundColor: '#F4929E',
    textColor: '#FFFFFF',
    ...settings.global_banner,
  };

  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable} ${dancingScript.variable} ${outfit.variable}`}>
      <body>
        <CartProvider phoneNumber={settings.whatsapp_number || '5581992265790'}>
          <GlobalBanner bannerData={globalBanner} />
          {children}
          <FloatingWhatsApp phoneNumber={settings.whatsapp_number || '5581992265790'} />
        </CartProvider>
      </body>
    </html>
  );
}
