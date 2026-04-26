import type { Metadata } from 'next'

// Layout dédié /rdv — sans manifest PWA ni appleWebApp
// (le root layout injecte manifest.json scope=/admin/ qui bloque Chrome hors-scope)
export const metadata: Metadata = {
  title: 'Prendre rendez-vous — MyCRM Pro',
  description:
    '15 minutes pour découvrir si MyCRM Pro correspond à votre activité. Choisissez un créneau téléphonique avec Jepht.',
  // On overwrite explicitement pour enlever le manifest et appleWebApp du root layout
  manifest: undefined,
  appleWebApp: undefined,
  icons: {
    icon: '/icon-192.png',
  },
}

export default function RdvLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
