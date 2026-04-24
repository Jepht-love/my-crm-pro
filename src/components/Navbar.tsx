"use client";

import { useState, useEffect } from "react";
import { Menu, X, Zap } from "lucide-react";

const navLinks = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Tarifs", href: "#pricing" },
  { label: "Guide gratuit", href: "/guide" },
  { label: "Démo", href: "/demo" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={
        scrolled
          ? { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }
          : { background: "transparent" }
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center group-hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #7C5CFC, #6C47FF)" }}
            >
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className={`font-bold text-lg transition-colors ${scrolled ? "text-slate-900" : "text-white"}`}>
              My<span style={{ color: scrolled ? "#6C47FF" : "#C4B5FD" }}>CRM</span>Pro
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              link.href === "/guide" ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semibold flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all hover:opacity-90"
                  style={{ background: "rgba(124,92,252,0.12)", color: scrolled ? "#7C5CFC" : "#C4B5FD", border: "1px solid rgba(124,92,252,0.2)" }}
                >
                  <span>🎁</span> {link.label}
                </a>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${scrolled ? "text-slate-600 hover:text-violet-600" : "text-slate-200 hover:text-white"}`}
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className={`text-sm font-medium transition-colors ${scrolled ? "text-slate-500 hover:text-violet-600" : "text-slate-300 hover:text-white"}`}
            >
              Se connecter
            </a>
            <a
              href="/signup"
              className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #7C5CFC, #6C47FF)", boxShadow: "0 2px 16px rgba(124,92,252,0.35)" }}
            >
              Essayer gratuitement
            </a>
          </div>

          {/* Mobile button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? "text-slate-600 hover:bg-slate-100" : "text-white hover:bg-white/10"}`}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-white border-t border-slate-100 py-4 rounded-b-2xl shadow-xl">
            {navLinks.map((link) => (
              link.href === "/guide" ? (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 mx-3 my-1 px-4 py-3 text-sm font-semibold rounded-xl transition-colors"
                  style={{ background: "rgba(124,92,252,0.08)", color: "#7C5CFC" }}
                >
                  <span>🎁</span> {link.label}
                </a>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-slate-600 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                >
                  {link.label}
                </a>
              )
            ))}
            <div className="px-4 pt-3 border-t border-slate-100 mt-2 space-y-2">
              <a
                href="/login"
                onClick={() => setOpen(false)}
                className="block w-full text-center border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Se connecter
              </a>
              <a
                href="/signup"
                onClick={() => setOpen(false)}
                className="block w-full text-center text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                style={{ background: "linear-gradient(135deg, #7C5CFC, #6C47FF)" }}
              >
                Essayer gratuitement
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
