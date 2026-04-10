"use client";

import { useState } from "react";
import { Send, CheckCircle2, Mail, MapPin } from "lucide-react";

const sectors = [
  "Commerce de détail",
  "Restauration / Traiteur",
  "Artisanat",
  "Cave à vins / Épicerie fine",
  "Marché / Vente ambulante",
  "Autre",
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    sector: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-28" style={{ background: "linear-gradient(180deg, #F1F0FF 0%, #FAFAFE 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-violet-600 font-semibold text-sm uppercase tracking-widest mb-4 px-4 py-1.5 bg-violet-100 rounded-full">
            Demander une démo
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-5 leading-tight">
            30 minutes pour tout voir.{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #7C5CFC, #4F46E5)" }}>
              Sans engagement.
            </span>
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Remplissez le formulaire et notre équipe vous recontacte sous 24h pour planifier
            une démonstration personnalisée à votre activité.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Left — Contact info */}
          <div>
            <div className="space-y-5 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,92,252,0.10)" }}>
                  <Mail className="w-5 h-5" style={{ color: "#7C5CFC" }} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 mb-0.5">Email</p>
                  <p className="text-slate-500 text-sm">financialservices@my-crmpro.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,92,252,0.10)" }}>
                  <MapPin className="w-5 h-5" style={{ color: "#7C5CFC" }} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 mb-0.5">Basé en France</p>
                  <p className="text-slate-500 text-sm">Données hébergées en Europe · RGPD compliant</p>
                </div>
              </div>
            </div>

            {/* What to expect */}
            <div className="bg-white rounded-3xl p-7 border" style={{ borderColor: "#E8E6FF", boxShadow: "0 4px 24px rgba(124,92,252,0.06)" }}>
              <h3 className="font-bold text-slate-900 mb-5">Ce que vous obtiendrez :</h3>
              <ul className="space-y-4">
                {[
                  "Une démo personnalisée à votre secteur d'activité",
                  "Une réponse à toutes vos questions sans pression commerciale",
                  "Un accès d'essai de 14 jours si vous souhaitez tester",
                  "Un devis clair et transparent selon vos besoins",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#7C5CFC" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — Form */}
          <div>
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 rounded-3xl border" style={{ background: "rgba(124,92,252,0.04)", borderColor: "rgba(124,92,252,0.2)" }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #7C5CFC, #6C47FF)" }}>
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Message envoyé !</h3>
                <p className="text-slate-600">
                  Merci {form.name}. Notre équipe vous contacte dans les 24h pour planifier votre démo.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border space-y-5" style={{ borderColor: "#E8E6FF", boxShadow: "0 4px 24px rgba(124,92,252,0.06)" }}>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Nom complet <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Sophie Martin"
                      className="w-full border rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:outline-none"
                      style={{ borderColor: "#E2E0FF" }}
                      onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,92,252,0.12)"}
                      onBlur={e => e.currentTarget.style.boxShadow = "none"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email professionnel <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="sophie@moncommerce.fr"
                      className="w-full border rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:outline-none"
                      style={{ borderColor: "#E2E0FF" }}
                      onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,92,252,0.12)"}
                      onBlur={e => e.currentTarget.style.boxShadow = "none"}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full border rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:outline-none"
                      style={{ borderColor: "#E2E0FF" }}
                      onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,92,252,0.12)"}
                      onBlur={e => e.currentTarget.style.boxShadow = "none"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Secteur d&apos;activité <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="sector"
                      required
                      value={form.sector}
                      onChange={handleChange}
                      className="w-full border rounded-xl px-4 py-3 text-slate-900 bg-white transition-all focus:outline-none"
                      style={{ borderColor: "#E2E0FF" }}
                    >
                      <option value="">Choisir...</option>
                      {sectors.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Votre situation actuelle
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Décrivez brièvement votre activité et ce que vous cherchez à améliorer..."
                    className="w-full border rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 transition-all resize-none focus:outline-none"
                    style={{ borderColor: "#E2E0FF" }}
                    onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,92,252,0.12)"}
                    onBlur={e => e.currentTarget.style.boxShadow = "none"}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base hover:opacity-90 hover:shadow-xl disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #7C5CFC, #6C47FF)", boxShadow: "0 4px 20px rgba(124,92,252,0.30)" }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Demander ma démo gratuite
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-400 text-center">
                  En soumettant ce formulaire, vous acceptez d&apos;être recontacté par notre équipe.
                  Aucun spam, promis.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
