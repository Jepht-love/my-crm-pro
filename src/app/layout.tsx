import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My CRM Pro — Le back-office complet pour TPE, PME et indépendants",
  description:
    "Gérez vos commandes, votre stock, vos factures et vos clients depuis un seul tableau de bord. Sans équipe IT, sans engagement. My CRM Pro est opérationnel en moins de 24h.",
  keywords: "CRM, back-office, gestion commandes, stock, facturation, TPE, PME, indépendants",
  openGraph: {
    title: "My CRM Pro — Le back-office complet pour TPE, PME et indépendants",
    description:
      "Gérez vos commandes, votre stock, vos factures et vos clients depuis un seul tableau de bord.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
