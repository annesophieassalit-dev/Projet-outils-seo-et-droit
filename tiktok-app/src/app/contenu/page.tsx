"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ContenuPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <header className="bg-[#2B2B2B] text-white px-6 py-4 flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-white"><ArrowLeft className="h-4 w-4" /></Link>
        <h1 className="font-bold">Mes contenus</h1>
      </header>
      <div className="max-w-3xl mx-auto p-6 text-center py-16">
        <p className="text-gray-500 text-sm">Génère du contenu depuis la page principale pour le voir ici.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-[#2B2B2B] underline">← Retour à l'accueil</Link>
      </div>
    </div>
  );
}
