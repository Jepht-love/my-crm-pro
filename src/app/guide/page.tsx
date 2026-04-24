'use client'

import { useState } from 'react'
import { Zap, Copy, Check, ArrowRight, Clock, ChevronDown, Mail } from 'lucide-react'
import Link from 'next/link'

/* ─── Types ────────────────────────────────────────────────────── */
interface Automation {
  titre: string
  temps: string
  comment: string
  outil: string
}

interface SectorGuide {
  emoji: string
  label: string
  slug: string
  accroche: string
  automations: Automation[]
  prompt: string
}

/* ─── Data ─────────────────────────────────────────────────────── */
const SECTORS: SectorGuide[] = [
  {
    emoji: '🍽️',
    label: 'Restauration',
    slug: 'restauration',
    accroche: 'Remplissez vos tables et fidélisez vos habitués sans effort.',
    automations: [
      {
        titre: 'Relance réservation non confirmée',
        temps: '1h 45min/semaine économisées',
        comment: 'Un email + SMS s\'envoie automatiquement 4h avant le service si le client n\'a pas confirmé sa résa. Taux de no-show divisé par 3.',
        outil: 'MyCRM Pro → Newsletter + Webhook',
      },
      {
        titre: 'Carte du soir envoyée à 17h',
        temps: '2h/semaine économisées',
        comment: 'Chaque jour à 17h, votre menu du soir est envoyé à votre liste de clients fidèles avec un lien de réservation direct. Zéro manipulation manuelle.',
        outil: 'MyCRM Pro → Newsletter planifiée',
      },
      {
        titre: 'Alerte stock critique avant commande fournisseur',
        temps: '1h 15min/semaine économisées',
        comment: 'Quand une matière première passe sous le seuil d\'alerte, vous recevez un email récapitulatif avec la liste exacte à commander. Fini les ruptures surprise.',
        outil: 'MyCRM Pro → Stock + Alertes',
      },
    ],
    prompt: `Tu es mon assistant CRM pour mon restaurant.
Voici mes besoins :
- Je reçois en moyenne [X] réservations par semaine
- Mes horaires de service : [ex. 12h-14h / 19h-22h]
- Ma spécialité : [ex. cuisine italienne / bistronomie]
- Mon email de contact : [ton@email.fr]

Génère-moi :
1. Un email de relance de réservation (ton chaleureux, 80 mots max)
2. Un email "carte du soir" avec CTA réservation (60 mots max)
3. Un message SMS de rappel réservation J-1 (160 caractères max)

Adapte le ton à un restaurant [haut de gamme / familial / branché].`,
  },
  {
    emoji: '🛍️',
    label: 'Commerce & Boutique',
    slug: 'boutique',
    accroche: 'Transformez vos visiteurs en clients fidèles sur autopilote.',
    automations: [
      {
        titre: 'Email de bienvenue + bon de réduction',
        temps: '2h/semaine économisées',
        comment: 'Dès qu\'un nouveau client passe commande, il reçoit un email de bienvenue personnalisé avec un bon de -10% sur son prochain achat. Taux de réachat +34%.',
        outil: 'MyCRM Pro → Commandes + Newsletter',
      },
      {
        titre: 'Relance clients inactifs 60 jours',
        temps: '1h 30min/semaine économisées',
        comment: 'Tous les clients qui n\'ont pas commandé depuis 60 jours reçoivent automatiquement un email "Vous nous manquez" avec une offre exclusive. Récupère 18% des clients dormants.',
        outil: 'MyCRM Pro → Clients + Automatisation',
      },
      {
        titre: 'Alerte stock faible → commande auto',
        temps: '1h 30min/semaine économisées',
        comment: 'Dès qu\'un produit passe sous le seuil d\'alerte, vous recevez la liste de réapprovisionnement et le bon de commande pré-rempli fournisseur. Stock jamais en rupture.',
        outil: 'MyCRM Pro → Stock + Alertes',
      },
    ],
    prompt: `Tu es mon assistant e-commerce pour ma boutique [type de boutique].
Voici mon contexte :
- Ticket moyen : [X] €
- Catégorie principale : [ex. prêt-à-porter / décoration / alimentaire]
- Ma clientèle : [ex. femmes 30-50 ans / jeunes actifs / familles]
- Fréquence d'achat attendue : [ex. 1 fois/mois]

Génère-moi :
1. Un email de bienvenue après 1er achat (chaleureux, 100 mots max, bon de réduction inclus)
2. Un email de relance "clients inactifs 60j" (sans culpabiliser, offre exclusive, 80 mots)
3. Un objet d'email A/B test pour chaque message (2 variantes)

Mon nom de boutique : [Nom de la boutique]`,
  },
  {
    emoji: '🔨',
    label: 'Artisanat & Services',
    slug: 'artisanat',
    accroche: 'Moins de téléphone, plus de chantiers. Automatisez votre administratif.',
    automations: [
      {
        titre: 'Devis automatique sous 2h',
        temps: '2h 30min/semaine économisées',
        comment: 'Quand un prospect remplit votre formulaire de contact, il reçoit automatiquement un devis estimatif personnalisé sous 2h. Vous passez en tête avant vos concurrents.',
        outil: 'MyCRM Pro → Devis + Leads',
      },
      {
        titre: 'Rappel de RDV client J-1',
        temps: '1h/semaine économisées',
        comment: 'La veille de chaque intervention, votre client reçoit un rappel avec l\'heure, l\'adresse et votre numéro de téléphone. Fini les "j\'avais oublié" et les déplacements pour rien.',
        outil: 'MyCRM Pro → Agenda + SMS',
      },
      {
        titre: 'Relance facture impayée J+30',
        temps: '1h 30min/semaine économisées',
        comment: 'Si une facture n\'est pas réglée à 30 jours, un email de relance cordial part automatiquement avec le PDF en pièce jointe et un lien de paiement. Délai moyen de règlement réduit de 12 jours.',
        outil: 'MyCRM Pro → Factures + Relance',
      },
    ],
    prompt: `Tu es mon assistant administratif pour mon activité d'artisan [métier].
Mon contexte :
- Mon métier : [ex. plombier / électricien / menuisier / peintre]
- Zone d'intervention : [département / région]
- Prix horaire moyen : [X] €/h
- Délai habituel entre devis et intervention : [X] jours

Génère-moi :
1. Un email de devis estimatif après demande de contact (professionnel, rassurant, 120 mots)
2. Un SMS de rappel de RDV J-1 (160 caractères max, inclure heure + adresse)
3. Un email de relance facture impayée à 30 jours (cordial mais ferme, 80 mots)

Ton commercial : sérieux, local, de confiance.`,
  },
  {
    emoji: '💅',
    label: 'Beauté & Bien-être',
    slug: 'beaute',
    accroche: 'Remplissez votre agenda et chouchoutez vos clientes automatiquement.',
    automations: [
      {
        titre: 'Rappel de RDV 48h + 24h avant',
        temps: '2h/semaine économisées',
        comment: 'Deux rappels automatiques : J-2 par email et J-1 par SMS avec lien d\'annulation. Taux de no-show réduit de 70%. Plus de trous dans l\'agenda.',
        outil: 'MyCRM Pro → Agenda + Newsletter',
      },
      {
        titre: 'Programme fidélité au 5ème soin',
        temps: '1h 30min/semaine économisées',
        comment: 'Après le 5ème rendez-vous, votre cliente reçoit automatiquement un email "Carte fidélité atteinte" avec son soin offert. Elle se sent choyée et revient.',
        outil: 'MyCRM Pro → Clients + Commandes',
      },
      {
        titre: 'Relance clientes inactives 45 jours',
        temps: '1h 30min/semaine économisées',
        comment: 'Toutes les clientes absentes depuis 45 jours reçoivent un email "Votre peau vous réclame" avec une offre de retour exclusive. Taux de réactivation : 22%.',
        outil: 'MyCRM Pro → Clients + Automatisation',
      },
    ],
    prompt: `Tu es mon assistante marketing pour mon institut/salon [type].
Mon contexte :
- Mon activité : [ex. salon de coiffure / institut de beauté / spa]
- Ma clientèle principale : [ex. femmes 25-55 ans]
- Mes soins phares : [ex. brushing, épilation, soins visage]
- Mon tarif moyen par visite : [X] €

Génère-moi :
1. Un SMS de rappel de RDV J-1 (160 caractères, ton chaleureux)
2. Un email "Carte fidélité atteinte — votre cadeau vous attend" (enthousiaste, 80 mots)
3. Un email de relance "clientes inactives 45j" (doux, pas culpabilisant, offre incluse, 100 mots)

Signe avec : [Prénom] de [Nom du salon]`,
  },
  {
    emoji: '🏠',
    label: 'Immobilier',
    slug: 'immobilier',
    accroche: 'Gérez plus de mandats, perdez moins de temps en relances.',
    automations: [
      {
        titre: 'Dossier digital envoyé en 2 min',
        temps: '2h 30min/semaine économisées',
        comment: 'Après chaque visite, le prospect reçoit automatiquement la fiche du bien, les diagnostics, et le dossier de financement pré-rempli. Vous êtes le plus réactif du secteur.',
        outil: 'MyCRM Pro → Clients + Export',
      },
      {
        titre: 'Alerte "nouveau bien" selon profil',
        temps: '1h 30min/semaine économisées',
        comment: 'Quand un nouveau bien entre au catalogue, les acheteurs ayant un profil correspondant reçoivent un email d\'alerte personnalisé en 5 minutes. Zéro tri manuel.',
        outil: 'MyCRM Pro → Produits + Newsletter segmentée',
      },
      {
        titre: 'Relance promesse à J+7',
        temps: '1h/semaine économisées',
        comment: 'Quand une promesse de vente n\'est pas signée 7 jours après l\'accord oral, un rappel automatique est envoyé au prospect et une alerte interne à l\'agent. Zéro deal perdu par oubli.',
        outil: 'MyCRM Pro → Commandes + Alertes',
      },
    ],
    prompt: `Tu es mon assistant commercial pour mon agence immobilière.
Mon contexte :
- Zone géographique : [ville / département]
- Type de biens principaux : [ex. appartements / maisons / commerces]
- Prix moyen des biens : [X] €
- Délai moyen de vente : [X] mois

Génère-moi :
1. Un email post-visite avec récapitulatif du bien et prochaines étapes (professionnel, 120 mots)
2. Un email "alerte nouveau bien" pour acheteurs avec profil correspondant (enthousiaste, 100 mots)
3. Un email de relance promesse non signée à J+7 (rassurant, sans pression, 80 mots)

Signature professionnelle : [Prénom Nom], [Agence], [Téléphone]`,
  },
  {
    emoji: '🏥',
    label: 'Santé & Para-médical',
    slug: 'sante',
    accroche: 'Concentrez-vous sur vos patients. Le reste se gère seul.',
    automations: [
      {
        titre: 'Rappel RDV + questionnaire pré-consultation',
        temps: '2h/semaine économisées',
        comment: 'J-2, votre patient reçoit un rappel avec un lien vers un formulaire pré-consultation à remplir en 3 min. Vous arrivez préparé, la séance démarre directement.',
        outil: 'MyCRM Pro → Agenda + Formulaire',
      },
      {
        titre: 'Invitation renouvellement ordonnance J-14',
        temps: '1h 30min/semaine économisées',
        comment: '14 jours avant la fin de validité d\'une ordonnance, le patient reçoit un rappel automatique pour prendre RDV. Continuité de soin garantie, agenda rempli à l\'avance.',
        outil: 'MyCRM Pro → Clients + Newsletter',
      },
      {
        titre: 'Bilan annuel — invitation automatique',
        temps: '1h 30min/semaine économisées',
        comment: 'Chaque patient reçoit une invitation à son bilan annuel exactement 12 mois après sa dernière consultation. Rétention patient maximale, sans effort.',
        outil: 'MyCRM Pro → Clients + Automatisation',
      },
    ],
    prompt: `Tu es mon assistant administratif pour mon cabinet [spécialité].
Mon contexte :
- Ma spécialité : [ex. kinésithérapeute / ostéopathe / naturopathe / diététicien]
- Durée moyenne d'une consultation : [X] min
- Fréquence recommandée de suivi : [ex. tous les 3 mois]
- Mes honoraires : [X] €/séance

Génère-moi :
1. Un email de rappel de RDV avec lien formulaire pré-consultation J-2 (bienveillant, 80 mots)
2. Un email d'invitation renouvellement ordonnance/suivi J-14 (pédagogique, 100 mots)
3. Un email "bilan annuel" invitation à reprendre RDV (chaleureux, 80 mots)

Signature : [Prénom Nom], [Titre], [Cabinet], [Téléphone]`,
  },
]

/* ─── Composant copier ──────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
      style={{
        background: copied
          ? 'linear-gradient(135deg, #10B981, #059669)'
          : 'linear-gradient(135deg, #7C5CFC, #5B3FE3)',
        color: '#fff',
      }}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Copié !' : 'Copier le prompt'}
    </button>
  )
}

/* ─── Page principale ───────────────────────────────────────────── */
export default function GuidePage() {
  const [selected, setSelected] = useState<SectorGuide | null>(null)
  const [page, setPage] = useState<1 | 2>(1)

  function chooseSector(s: SectorGuide) {
    setSelected(s)
    setPage(1)
    setTimeout(() => {
      document.getElementById('guide-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
          >
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-gray-900">
            My<span style={{ color: '#7C5CFC' }}>CRM</span>Pro
          </span>
        </Link>
        <Link
          href="/signup"
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
        >
          Essai gratuit 14j →
        </Link>
      </header>

      {/* ── Hero ── */}
      <section
        className="px-4 py-20 text-center"
        style={{ background: 'linear-gradient(160deg, #faf8ff 0%, #f0ebff 50%, #faf8ff 100%)' }}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
          style={{ background: 'rgba(124,92,252,0.1)', color: '#7C5CFC', border: '1px solid rgba(124,92,252,0.2)' }}>
          <Clock className="w-3.5 h-3.5" />
          Guide gratuit — 2 pages — Résultats en 48h
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 max-w-4xl mx-auto">
          3 automatisations qui vous font{' '}
          <span
            className="relative"
            style={{
              background: 'linear-gradient(135deg, #7C5CFC, #9D85FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            gagner 5h par semaine
          </span>
        </h1>

        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Choisissez votre secteur. Recevez le guide en 2 pages pensé pour votre activité,
          avec un <strong className="text-gray-700">prompt prêt à copier-coller</strong> pour lancer vos automatisations dès aujourd&apos;hui.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 flex-wrap text-center mb-12">
          {[
            { value: '+2 400', label: 'TPE & PME utilisatrices' },
            { value: '5h/sem', label: 'Gagnées en moyenne' },
            { value: '48h', label: 'Pour voir les premiers résultats' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-extrabold" style={{ color: '#7C5CFC' }}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="flex flex-col items-center gap-2 text-gray-400 text-sm animate-bounce">
          <span>Choisissez votre secteur ci-dessous</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* ── Sélecteur de secteur ── */}
      <section className="px-4 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-3">
          Votre secteur d&apos;activité
        </h2>
        <p className="text-gray-500 text-center mb-10 text-sm">
          Le guide s&apos;adapte instantanément à votre métier
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SECTORS.map((s) => {
            const isSelected = selected?.slug === s.slug
            return (
              <button
                key={s.slug}
                onClick={() => chooseSector(s)}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-center"
                style={{
                  borderColor: isSelected ? '#7C5CFC' : 'transparent',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(124,92,252,0.08), rgba(157,133,255,0.04))'
                    : '#F8F7FF',
                  boxShadow: isSelected ? '0 0 0 4px rgba(124,92,252,0.12)' : 'none',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                }}
              >
                <span className="text-3xl">{s.emoji}</span>
                <span
                  className="text-xs font-bold leading-tight"
                  style={{ color: isSelected ? '#7C5CFC' : '#374151' }}
                >
                  {s.label}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Contenu du guide ── */}
      {selected && (
        <section id="guide-content" className="px-4 pb-24 max-w-4xl mx-auto">

          {/* Header du guide */}
          <div
            className="rounded-3xl p-8 mb-6 text-center"
            style={{
              background: 'linear-gradient(135deg, #7C5CFC 0%, #5B3FE3 100%)',
            }}
          >
            <div className="text-5xl mb-4">{selected.emoji}</div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}>
              Guide {selected.label} — 2 pages
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              3 automatisations pour{' '}
              <span style={{ color: '#C4B5FD' }}>{selected.label}</span>
            </h2>
            <p className="text-violet-200 text-base max-w-xl mx-auto">{selected.accroche}</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Clock className="w-4 h-4 text-violet-300" />
              <span className="text-violet-200 text-sm font-semibold">
                Total estimé : 5h+ économisées par semaine
              </span>
            </div>
          </div>

          {/* Onglets Page 1 / Page 2 */}
          <div className="flex gap-2 mb-6">
            {([1, 2] as const).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: page === p ? 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' : '#F3F4F6',
                  color: page === p ? '#fff' : '#6B7280',
                }}
              >
                Page {p} — {p === 1 ? 'Les 3 automatisations' : 'Prompt prêt à l\'emploi'}
              </button>
            ))}
          </div>

          {/* ── PAGE 1 : Les 3 automatisations ── */}
          {page === 1 && (
            <div className="space-y-5">
              {selected.automations.map((auto, i) => (
                <div
                  key={i}
                  className="rounded-2xl border overflow-hidden"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  {/* Header automatisation */}
                  <div
                    className="flex items-center gap-4 px-6 py-4"
                    style={{ background: 'linear-gradient(135deg, #FAFAFA, #F3F0FF)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-extrabold"
                      style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)', color: '#fff' }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">{auto.titre}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3" style={{ color: '#10B981' }} />
                        <span className="text-xs font-semibold" style={{ color: '#10B981' }}>
                          {auto.temps}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-5 bg-white">
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{auto.comment}</p>
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono"
                      style={{ background: '#F3F0FF', color: '#7C5CFC' }}
                    >
                      <Zap className="w-3 h-3 flex-shrink-0" />
                      {auto.outil}
                    </div>
                  </div>
                </div>
              ))}

              {/* CTA page 2 */}
              <button
                onClick={() => setPage(2)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
              >
                Accéder au prompt prêt à l&apos;emploi
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── PAGE 2 : Prompt ── */}
          {page === 2 && (
            <div className="space-y-6">
              {/* Intro */}
              <div
                className="rounded-2xl p-6"
                style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0' }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">🤖</span>
                  <div>
                    <p className="font-bold text-gray-900 mb-1">Comment utiliser ce prompt ?</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Copiez le texte ci-dessous, collez-le dans{' '}
                      <strong>ChatGPT</strong>, <strong>Claude</strong> ou <strong>Gemini</strong>.
                      Remplacez les <strong>[crochets]</strong> par vos informations réelles.
                      Obtenez vos emails, SMS et messages en 30 secondes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Le prompt */}
              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{ background: '#1E1B2E' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="ml-2 text-xs text-slate-500 font-mono">prompt_{selected.slug}.txt</span>
                  </div>
                  <CopyButton text={selected.prompt} />
                </div>
                <pre
                  className="p-6 text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap"
                  style={{ background: '#0F0D1F', color: '#C4B5FD', fontFamily: 'ui-monospace, monospace' }}
                >
                  {selected.prompt}
                </pre>
              </div>

              {/* Tips */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { emoji: '⚡', title: 'Étape 1', desc: 'Copiez le prompt et remplissez vos informations dans les crochets.' },
                  { emoji: '🤖', title: 'Étape 2', desc: 'Collez dans ChatGPT / Claude et générez vos messages en 30s.' },
                  { emoji: '🚀', title: 'Étape 3', desc: 'Importez les messages dans MyCRM Pro et activez l\'automatisation.' },
                ].map(tip => (
                  <div
                    key={tip.title}
                    className="rounded-2xl p-5 border text-center"
                    style={{ borderColor: '#E5E7EB', background: '#FAFAFA' }}
                  >
                    <div className="text-2xl mb-2">{tip.emoji}</div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{tip.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{tip.desc}</p>
                  </div>
                ))}
              </div>

              {/* Retour page 1 */}
              <button
                onClick={() => setPage(1)}
                className="text-sm text-gray-400 hover:text-gray-700 transition-colors underline block text-center"
              >
                ← Revoir les 3 automatisations
              </button>
            </div>
          )}

          {/* ── CTA principal ── */}
          <div
            className="mt-10 rounded-3xl p-8 text-center"
            style={{ background: 'linear-gradient(135deg, #0F0D1F 0%, #1A1635 100%)' }}
          >
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-xl font-extrabold text-white mb-2">
              Prêt à automatiser votre {selected.label.toLowerCase()} ?
            </h3>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              MyCRM Pro configure ces 3 automatisations en moins d&apos;une heure.
              14 jours gratuits, sans carte bancaire.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
              >
                Démarrer gratuitement
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/demo"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#9D85FF', border: '1px solid rgba(157,133,255,0.2)' }}
              >
                Voir la démo →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer
        className="px-6 py-10 border-t text-center"
        style={{ background: '#FAFAFA', borderColor: '#F0F0F0' }}
      >
        <Link href="/" className="flex items-center gap-2 justify-center mb-4">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #5B3FE3)' }}
          >
            <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-gray-700">
            My<span style={{ color: '#7C5CFC' }}>CRM</span>Pro
          </span>
        </Link>
        <p className="text-gray-400 text-xs mb-2">
          Le CRM pensé pour les TPE &amp; PME françaises
        </p>
        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
          <Mail className="w-3 h-3" />
          <a href="mailto:jepht@my-crmpro.com" className="hover:text-gray-700 transition-colors">
            jepht@my-crmpro.com
          </a>
        </div>
        <p className="text-gray-300 text-xs mt-4">© 2026 MyCRM Pro · my-crmpro.com</p>
      </footer>

    </div>
  )
}
