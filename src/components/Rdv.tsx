import { Calendar, Clock, Video, ArrowRight, Phone } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    icon: Calendar,
    title: "Choisissez un créneau",
    desc: "Consultez le calendrier en temps réel et réservez le créneau qui vous convient — Lun au Ven.",
  },
  {
    icon: Video,
    title: "Recevez le lien Google Meet",
    desc: "Un email de confirmation avec le lien Google Meet vous est envoyé automatiquement.",
  },
  {
    icon: Phone,
    title: "On échange 30 minutes",
    desc: "Jepht analyse votre activité et vous montre comment MyCRM Pro peut vous faire gagner du temps.",
  },
];

export default function Rdv() {
  return (
    <section id="rdv" className="py-16 sm:py-24" style={{ background: "#07051A" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-violet-400 font-semibold text-sm uppercase tracking-widest mb-4 px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full">
            Réservez un appel
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
            30 minutes pour{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg, #7C5CFC, #4F46E5)" }}
            >
              tout changer
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Un appel découverte gratuit avec Jepht pour voir si MyCRM Pro correspond à votre activité.
            Aucun engagement, aucune carte bancaire.
          </p>
        </div>

        {/* Étapes */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-14">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-3xl p-7 flex flex-col gap-4"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Numéro */}
              <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white"
                style={{ background: "linear-gradient(135deg, #7C5CFC, #6C47FF)" }}>
                {i + 1}
              </div>

              {/* Icône */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(124,92,252,0.12)", border: "1px solid rgba(124,92,252,0.2)" }}
              >
                <step.icon className="w-5 h-5" style={{ color: "#9D85FF" }} />
              </div>

              <div>
                <h3 className="text-white font-bold text-base mb-1.5">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA card */}
        <div
          className="max-w-2xl mx-auto rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(124,92,252,0.15), rgba(79,70,229,0.10))", border: "1px solid rgba(124,92,252,0.25)" }}
        >
          {/* Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,92,252,0.18) 0%, transparent 70%)" }}
          />

          <div className="relative">
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 flex-wrap mb-8">
              {[
                { value: "30 min", label: "Durée de l'appel" },
                { value: "100%", label: "Gratuit" },
                { value: "Google Meet", label: "Lien envoyé par email" },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <Link
              href="/rdv"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-base transition-all hover:opacity-90 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #7C5CFC, #6C47FF)",
                boxShadow: "0 8px 32px rgba(124,92,252,0.35)",
              }}
            >
              <Clock className="w-5 h-5" />
              Réserver mon créneau gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>

            <p className="text-slate-500 text-sm mt-4">
              Disponible Lun → Ven · 9h–12h et 14h–18h
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
