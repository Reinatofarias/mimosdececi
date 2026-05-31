import type { Metadata } from "next";
import { Inter, Playfair_Display, Dancing_Script, Outfit } from "next/font/google";
import "./globals.css";
import { FloatingWhatsApp } from '@/components/ui/FloatingWhatsApp/FloatingWhatsApp';
import { GlobalBanner } from '@/components/layout/GlobalBanner';
import { getSettings } from '@/lib/dal/settings';

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-display',
  display: 'swap',
});

const dancingScript = Dancing_Script({ 
  subsets: ["latin"],
  variable: '--font-accent',
  display: 'swap',
});

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: '--font-ui',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Mimos de Ceci | Presentes com Afeto",
  description: "Cestas artesanais e mimos exclusivos feitos com o coração para momentos especiais.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable} ${dancingScript.variable} ${outfit.variable}`}>
      <body>
        <GlobalBanner bannerData={settings.global_banner} />
        {children}
        <FloatingWhatsApp phoneNumber={settings.whatsapp_number} />
      </body>
    </html>
  );
}
