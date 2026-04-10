"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  Zap,
  LogOut,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  User,
} from "lucide-react";

type DemoRequest = {
  id: string;
  name: string;
  email: string;
  sector: string;
  message: string;
  status: "pending" | "contacted" | "converted" | "rejected";
  created_at: string;
};

const STATUS_LABELS: Record<DemoRequest["status"], string> = {
  pending: "En attente",
  contacted: "Contacté",
  converted: "Converti",
  rejected: "Refusé",
};

const STATUS_COLORS: Record<DemoRequest["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  contacted: "bg-sky-100 text-sky-700",
  converted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-slate-100 text-slate-500",
};

// Mock data for demonstration when Supabase is not yet configured
const MOCK_REQUESTS: DemoRequest[] = [
  {
    id: "1",
    name: "Sophie Marchand",
    email: "sophie@caveavins.fr",
    sector: "Cave à vins / Épicerie fine",
    message: "J'ai un commerce ambulant et je cherche à mieux gérer mes commandes.",
    status: "pending",
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "2",
    name: "Pierre Delacroix",
    email: "pierre@epiceriefine.fr",
    sector: "Commerce de détail",
    message: "Besoin d'un outil pour gérer stock et facturation.",
    status: "contacted",
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: "3",
    name: "Claire Fontaine",
    email: "claire@traiteur-fontaine.fr",
    sector: "Restauration / Traiteur",
    message: "Je veux automatiser mes devis clients et mes relances.",
    status: "converted",
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [requests, setRequests] = useState<DemoRequest[]>(MOCK_REQUESTS);
  const [filter, setFilter] = useState<DemoRequest["status"] | "all">("all");
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/admin/login");
          return;
        }

        setUserEmail(user.email ?? null);

        // Try to load real data from Supabase
        const { data, error } = await supabase
          .from("demo_requests")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setRequests(data as DemoRequest[]);
          setIsMock(false);
        }
      } catch {
        // Supabase not configured — stay with mock data
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch { /* noop */ }
    router.push("/admin/login");
  };

  const handleStatusChange = async (id: string, status: DemoRequest["status"]) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    if (!isMock) {
      try {
        const supabase = createClient();
        await supabase.from("demo_requests").update({ status }).eq("id", id);
      } catch { /* noop */ }
    }
  };

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    contacted: requests.filter((r) => r.status === "contacted").length,
    converted: requests.filter((r) => r.status === "converted").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">
              My<span className="text-indigo-400">CRM</span>Pro — Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            {userEmail && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <User className="w-3.5 h-3.5" />
                {userEmail}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mock data banner */}
        {isMock && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3 mb-6 flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-300">
              <strong>Mode démo :</strong> données fictives affichées. Configurez Supabase dans{" "}
              <code className="bg-amber-500/20 px-1 rounded">.env.local</code> et créez la table{" "}
              <code className="bg-amber-500/20 px-1 rounded">demo_requests</code> pour voir vos vraies demandes.
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total demandes", value: counts.all, icon: Mail, color: "text-slate-400" },
            { label: "En attente", value: counts.pending, icon: Clock, color: "text-amber-400" },
            { label: "Convertis", value: counts.converted, icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Refusés", value: counts.rejected, icon: XCircle, color: "text-slate-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {(["all", "pending", "contacted", "converted", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {f === "all" ? "Toutes" : STATUS_LABELS[f]}{" "}
              <span className="opacity-60">({counts[f]})</span>
            </button>
          ))}
        </div>

        {/* Requests table */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-600">
              <Mail className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Aucune demande dans cette catégorie</p>
            </div>
          ) : (
            filtered.map((req) => (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-white">{req.name}</p>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[req.status]}`}
                      >
                        {STATUS_LABELS[req.status]}
                      </span>
                    </div>
                    <p className="text-sm text-indigo-400 mb-1">{req.email}</p>
                    <p className="text-xs text-slate-500 mb-2">
                      {req.sector} · {new Date(req.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {req.message && (
                      <p className="text-sm text-slate-400 bg-slate-800/60 rounded-lg px-3 py-2 italic">
                        &ldquo;{req.message}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <a
                      href={`mailto:${req.email}?subject=Votre%20demande%20My%20CRM%20Pro&body=Bonjour%20${req.name}%2C`}
                      className="flex items-center gap-1.5 text-xs bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Écrire
                    </a>
                    <select
                      value={req.status}
                      onChange={(e) =>
                        handleStatusChange(req.id, e.target.value as DemoRequest["status"])
                      }
                      className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {Object.entries(STATUS_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
