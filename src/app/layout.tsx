import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rumbi · Tu camión no trae GPS, te tiene a ti",
  description:
    "Rumbi convierte a la gente que va en el camión en la información que nunca tuvimos: dónde viene y qué tan lleno va, en vivo y comunitario.",
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-dvh bg-ink font-sans antialiased">{children}</body>
    </html>
  );
}
