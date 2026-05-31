import type { Metadata } from "next";
import { Inter, Playfair_Display, Dancing_Script, Outfit } from "next/font/google";
import "./globals.css";
import { FloatingWhatsApp } from '@/components/ui/FloatingWhatsApp/FloatingWhatsApp';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dancingScript = Dancing_Script({ 
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
});

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mimos de Ceci - Presentes Personalizados",
  description: "Presentes personalizados, cestas e kits para datas comemorativas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable} ${dancingScript.variable} ${outfit.variable}`}>
      <body>
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
