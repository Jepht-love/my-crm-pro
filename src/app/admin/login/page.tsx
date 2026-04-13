"use client";

import { useState } from "react";
import { Zap, Eye, EyeOff, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Email ou mot de passe incorrect. Vérifiez vos identifiants.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Une erreur est survenue. Réessayez.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
      {/* Background blur orbs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center group-hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #7C5CFC, #6C47FF)" }}>
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl text-white">
                My<span style={{ color: "#9D85FF" }}>CRM</span>Pro
              </span>
            </a>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-white mb-2">Espace administrateur</h1>
            <p className="text-slate-400 text-sm">
              Connectez-vous pour accéder au tableau de bord
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@my-crmpro.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Config note */}
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-xs text-amber-300 leading-relaxed">
              <strong>Configuration requise :</strong> Ajoutez vos clés Supabase dans{" "}
              <code className="bg-amber-500/20 px-1 rounded">.env.local</code> pour activer
              l&apos;authentification. Créez un utilisateur admin dans votre projet Supabase.
            </p>
          </div>

          <p className="text-center text-xs text-slate-600 mt-4">
            <a href="/" className="hover:text-slate-400 transition-colors">
              ← Retour au site
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
