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
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon-192.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "192x192" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MyCRMPro Admin",
  },
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
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
