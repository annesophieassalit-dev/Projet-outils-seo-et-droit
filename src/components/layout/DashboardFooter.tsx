"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function DashboardFooter() {
  const [loading, setLoading] = useState(false);

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <footer className="border-t border-gray-100 bg-white px-6 py-3 flex items-center justify-between gap-4 shrink-0">
      <span className="text-xs text-gray-400">
        © 2026 Visible & Conforme · Ne constitue pas une consultation juridique.
      </span>
      <div className="flex items-center gap-5 text-xs text-gray-400">
        <Link href="/mentions-legales" className="hover:text-gray-600 transition-colors">
          Mentions légales
        </Link>
        <Link href="/cgv" className="hover:text-gray-600 transition-colors">
          CGV
        </Link>
        <button
          onClick={handlePortal}
          disabled={loading}
          className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="h-3 w-3 animate-spin" />}
          Se désabonner
        </button>
      </div>
    </footer>
  );
}
