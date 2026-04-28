"use client";

import { useState, useRef } from "react";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import {
  ShieldCheck, Linkedin, Instagram, Facebook,
  Music2, AtSign, LayoutGrid,
  Copy, RefreshCw, Check, Loader2, Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type NetworkId  = "linkedin" | "instagram" | "facebook" | "tiktok" | "threads" | "carousel";
type ObjectiveId = "faire-connaitre" | "inviter-contact" | "expliquer";
type ToneId      = "professionnel" | "chaleureux" | "direct";

// ─── Data ─────────────────────────────────────────────────────────────────────

const NETWORKS: {
  id: NetworkId;
  label: string;
  sublabel?: string;
  color: string;
  Icon: ComponentType<{ className?: string; style?: CSSProperties }>;
}[] = [
  { id: "linkedin",  label: "LinkedIn",   color: "#0077B5", Icon: Linkedin },
  { id: "instagram", label: "Instagram",  color: "#E1306C", Icon: Instagram },
  { id: "facebook",  label: "Facebook",   color: "#1877F2", Icon: Facebook },
  { id: "tiktok",    label: "TikTok",     color: "#010101", Icon: Music2 },
  { id: "threads",   label: "Threads",    color: "#101010", Icon: AtSign },
  { id: "carousel",  label: "Carrousel",  sublabel: "LinkedIn", color: "#0077B5", Icon: LayoutGrid },
];

const THEMES = [
  "Droit & communication bien-être",
  "SEO local",
  "IA & contenu conforme",
  "Visibilité Google",
  "Conformité web & CGV",
  "Kit Visible & Conforme™",
  "Juriste & praticiens bien-être",
  "Formation & accompagnement",
];

const OBJECTIVES: { id: ObjectiveId; label: string }[] = [
  { id: "faire-connaitre", label: "Faire connaître" },
  { id: "inviter-contact", label: "Inviter à me contacter" },
  { id: "expliquer",       label: "Expliquer / Éduquer" },
];

const TONES: { id: ToneId; label: string; desc: string }[] = [
  { id: "professionnel", label: "Professionnel", desc: "Expert sans condescendance" },
  { id: "chaleureux",    label: "Chaleureux",    desc: "Proche de la communauté" },
  { id: "direct",        label: "Direct",        desc: "Prise de position assumée" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseCarousel(text: string): { title: string; content: string }[] | null {
  const lines = text.split("\n");
  const slides: { title: string; content: string }[] = [];
  let current: { title: string; body: string[] } | null = null;

  for (const line of lines) {
    if (/^Slide\s+(\d+|[Ff]inale)/i.test(line)) {
      if (current) {
        const body = current.body.join("\n").trim();
        if (body) slides.push({ title: current.title, content: body });
      }
      current = { title: line.trim(), body: [] };
    } else if (current) {
      current.body.push(line);
    }
  }
  if (current) {
    const body = current.body.join("\n").trim();
    if (body) slides.push({ title: current.title, content: body });
  }
  return slides.length >= 2 ? slides : null;
}

function parseTikTok(text: string): { section: string; content: string }[] | null {
  const lines = text.split("\n");
  const sections: { section: string; content: string }[] = [];
  let current: { section: string; body: string[] } | null = null;

  for (const line of lines) {
    const match = /^\[([^\]]+)\]/.exec(line);
    if (match) {
      if (current && current.body.some((l) => l.trim())) {
        sections.push({ section: current.section, content: current.body.join("\n").trim() });
      }
      current = { section: match[1], body: [] };
    } else if (current) {
      current.body.push(line);
    }
  }
  if (current && current.body.some((l) => l.trim())) {
    sections.push({ section: current.section, content: current.body.join("\n").trim() });
  }
  return sections.length >= 2 ? sections : null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Pill({
  selected, onClick, children, size = "md",
}: {
  selected: boolean; onClick: () => void; children: ReactNode; size?: "sm" | "md";
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full border transition-all font-arimo",
        size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm",
        selected
          ? "bg-[#cf9090] text-white border-[#cf9090] shadow-sm font-semibold"
          : "bg-white text-gray-600 border-gray-200 hover:border-[#cf9090] hover:text-[#cf9090]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StepBadge({ n, active = true }: { n: string; active?: boolean }) {
  return (
    <span
      className="font-arimo text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
      style={{ backgroundColor: active ? "#cf9090" : "#f5d0d0", color: active ? "white" : "#bf7070" }}
    >
      {n}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StudioPage() {
  const [network,     setNetwork]     = useState<NetworkId>("linkedin");
  const [theme,       setTheme]       = useState("");
  const [objective,   setObjective]   = useState<ObjectiveId | "">("");
  const [tone,        setTone]        = useState<ToneId | "">("");
  const [precisions,  setPrecisions]  = useState("");
  const [result,      setResult]      = useState("");
  const [isLoading,   setIsLoading]   = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [variantSeed, setVariantSeed] = useState(0);

  const resultRef  = useRef<HTMLDivElement>(null);
  const canGenerate = !!(theme && objective && tone);

  async function generate(seed = variantSeed) {
    if (!canGenerate) return;
    setIsLoading(true);
    setResult("");
    setCopied(false);

    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ network, theme, objective, tone, precisions, variantSeed: seed }),
      });
      if (!res.ok || !res.body) throw new Error();

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let content   = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
        setResult(content);
      }
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch {
      setResult("Erreur. Vérifiez la clé API et réessayez.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVariant() {
    const next = variantSeed + 1;
    setVariantSeed(next);
    await generate(next);
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const selectedNet     = NETWORKS.find((n) => n.id === network)!;
  const carouselSlides  = network === "carousel" && result ? parseCarousel(result) : null;
  const tiktokSections  = network === "tiktok"   && result ? parseTikTok(result)   : null;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#fdf0f0 0%,#fff6f6 40%,#ffffff 100%)" }}>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-rose-100 bg-white/85 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 shrink-0" style={{ color: "#3aaa78" }} />
            <div className="leading-none">
              <div className="font-montserrat font-black text-[10px] tracking-[0.2em] uppercase text-gray-400">VISIBLE ET</div>
              <div className="font-montserrat font-black text-xl tracking-[0.15em] uppercase" style={{ color: "#cf9090" }}>CONFORME</div>
            </div>
          </div>
          <div className="text-right leading-tight">
            <div className="font-arimo text-[11px] font-medium uppercase tracking-widest text-gray-400">Studio de Contenu</div>
            <div className="font-serif italic text-sm text-gray-600">Anne-Sophie Assalit</div>
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        <div className="text-center pt-2 pb-3">
          <h1 className="font-montserrat text-2xl font-black text-gray-900 mb-1">Générer mon contenu</h1>
          <p className="font-arimo text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            Posts sur-mesure pour chaque réseau, dans ton style, conformes à ton positionnement
          </p>
        </div>

        {/* ── 01 Réseau ─────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <StepBadge n="01" />
            <h2 className="font-montserrat font-bold text-sm uppercase tracking-wider text-gray-500">Réseau social</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {NETWORKS.map(({ id, label, sublabel, color, Icon }) => {
              const active = network === id;
              return (
                <button
                  key={id}
                  onClick={() => setNetwork(id)}
                  className={[
                    "flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition-all",
                    active ? "border-[#cf9090] bg-rose-50 shadow-sm" : "border-gray-100 hover:border-rose-200 hover:bg-rose-50/40",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" style={{ color: active ? "#cf9090" : color }} />
                  <div className="text-center leading-none">
                    <div className={`font-arimo text-xs font-semibold ${active ? "text-[#cf9090]" : "text-gray-700"}`}>{label}</div>
                    {sublabel && <div className="font-serif italic text-[10px] text-gray-400">{sublabel}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── 02 Paramètres ─────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-5 space-y-5">
          <div className="flex items-center gap-2">
            <StepBadge n="02" />
            <h2 className="font-montserrat font-bold text-sm uppercase tracking-wider text-gray-500">Paramètres du post</h2>
          </div>

          {/* Thème */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="font-arimo text-sm font-medium text-gray-700">Thème</span>
              {!theme && <span className="text-[#cf9090] text-xs">*</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t) => (
                <Pill key={t} selected={theme === t} onClick={() => setTheme(theme === t ? "" : t)} size="sm">{t}</Pill>
              ))}
            </div>
          </div>

          {/* Objectif */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="font-arimo text-sm font-medium text-gray-700">Objectif</span>
              {!objective && <span className="text-[#cf9090] text-xs">*</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {OBJECTIVES.map(({ id, label }) => (
                <Pill key={id} selected={objective === id} onClick={() => setObjective(objective === id ? "" : id)}>{label}</Pill>
              ))}
            </div>
          </div>

          {/* Ton */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="font-arimo text-sm font-medium text-gray-700">Ton</span>
              {!tone && <span className="text-[#cf9090] text-xs">*</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {TONES.map(({ id, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setTone(tone === id ? "" : id)}
                  className={[
                    "flex flex-col items-start px-4 py-2.5 rounded-xl border-2 transition-all text-left",
                    tone === id ? "border-[#cf9090] bg-rose-50" : "border-gray-100 hover:border-rose-200",
                  ].join(" ")}
                >
                  <span className={`font-arimo text-sm font-semibold ${tone === id ? "text-[#cf9090]" : "text-gray-700"}`}>{label}</span>
                  <span className="font-arimo text-[11px] text-gray-400 mt-0.5">{desc}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Précisions ─────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm border border-rose-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <StepBadge n="03" active={false} />
            <h2 className="font-montserrat font-bold text-sm uppercase tracking-wider text-gray-500">
              Précisions <span className="normal-case font-normal text-gray-400 tracking-normal">(optionnel)</span>
            </h2>
          </div>
          <textarea
            value={precisions}
            onChange={(e) => setPrecisions(e.target.value)}
            placeholder="Angle particulier, exemple concret, actualité, lien avec une offre en cours..."
            rows={3}
            className="w-full rounded-xl border border-gray-200 p-4 font-arimo text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:border-[#cf9090] focus:ring-2 focus:ring-[#cf9090]/20 transition-all"
          />
        </section>

        {/* ── Bouton générer ────────────────────────────────────────── */}
        <button
          onClick={() => generate()}
          disabled={!canGenerate || isLoading}
          className={[
            "w-full py-4 rounded-2xl font-montserrat font-black text-base flex items-center justify-center gap-3 transition-all",
            canGenerate && !isLoading
              ? "bg-[#cf9090] text-white hover:bg-[#bf7070] shadow-md hover:shadow-lg active:scale-[0.99]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed",
          ].join(" ")}
        >
          {isLoading
            ? <><Loader2 className="h-5 w-5 animate-spin" />Génération en cours…</>
            : <><Sparkles className="h-5 w-5" />Générer le contenu</>
          }
        </button>

        {!canGenerate && (
          <p className="font-arimo text-xs text-center text-gray-400">
            Sélectionne un thème, un objectif et un ton pour continuer
          </p>
        )}

        {/* ── Résultat ──────────────────────────────────────────────── */}
        {(result || isLoading) && (
          <section ref={resultRef} className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">

            {/* Header résultat */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-rose-50" style={{ background: "linear-gradient(90deg,#fdf0f0,#fff8f8)" }}>
              <div className="flex items-center gap-2">
                <span className="font-arimo text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white" style={{ backgroundColor: "#cf9090" }}>
                  {selectedNet.label}{selectedNet.sublabel ? ` ${selectedNet.sublabel}` : ""}
                </span>
                {variantSeed > 0 && <span className="font-arimo text-xs text-gray-400">Variante #{variantSeed}</span>}
              </div>

              {result && !isLoading && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleVariant}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-arimo text-xs font-medium text-gray-600 border border-gray-200 hover:border-[#cf9090] hover:text-[#cf9090] transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />Variante
                  </button>
                  <button
                    onClick={handleCopy}
                    className={["flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-arimo text-xs font-medium transition-all",
                      copied ? "bg-[#3aaa78]/10 text-[#3aaa78] border border-[#3aaa78]/30" : "bg-[#cf9090] text-white hover:bg-[#bf7070]",
                    ].join(" ")}
                  >
                    {copied ? <><Check className="h-3.5 w-3.5" />Copié !</> : <><Copy className="h-3.5 w-3.5" />Copier</>}
                  </button>
                </div>
              )}
            </div>

            {/* Corps résultat */}
            <div className="p-5">
              {isLoading && !result ? (
                <div className="flex items-center gap-3 py-4 text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin shrink-0" style={{ color: "#cf9090" }} />
                  <span className="font-arimo text-sm">Génération en cours…</span>
                </div>

              ) : carouselSlides ? (
                <div className="space-y-3">
                  {carouselSlides.map((slide, i) => (
                    <div key={i} className="rounded-xl border border-rose-100 overflow-hidden">
                      <div className="px-4 py-2 font-montserrat text-xs font-black uppercase tracking-wider text-white" style={{ backgroundColor: "#cf9090" }}>
                        {slide.title}
                      </div>
                      <div className="px-4 py-3 font-arimo text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {slide.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && <div className="flex items-center gap-2 text-gray-400"><Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "#cf9090" }} /><span className="font-arimo text-xs">En cours…</span></div>}
                </div>

              ) : tiktokSections ? (
                <div className="space-y-3">
                  {tiktokSections.map((sec, i) => {
                    const colors = [
                      { bg: "#fdf0f0", border: "#edb0b0", label: "#cf9090" },
                      { bg: "#f0f6fd", border: "#b0cced", label: "#4a90d9" },
                      { bg: "#f0fdf6", border: "#a3e1c7", label: "#3aaa78" },
                    ];
                    const c = colors[i % colors.length];
                    return (
                      <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${c.border}`, background: c.bg }}>
                        <div className="px-4 py-1.5 font-arimo text-xs font-bold uppercase tracking-wider" style={{ color: c.label }}>{sec.section}</div>
                        <div className="px-4 py-3 font-arimo text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border-t border-white/60">{sec.content}</div>
                      </div>
                    );
                  })}
                  {isLoading && <div className="flex items-center gap-2 text-gray-400"><Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "#cf9090" }} /><span className="font-arimo text-xs">En cours…</span></div>}
                </div>

              ) : (
                <pre className="whitespace-pre-wrap font-arimo text-sm text-gray-800 leading-relaxed">
                  {result}
                  {isLoading && <span className="inline-block w-0.5 h-[1em] align-middle ml-px animate-pulse" style={{ backgroundColor: "#cf9090" }} />}
                </pre>
              )}
            </div>

            {/* Footer */}
            {result && !isLoading && (
              <div className="px-5 py-3 border-t border-rose-50 bg-rose-50/20 flex items-center justify-between">
                <span className="font-arimo text-xs text-gray-400">
                  {result.length} caractères
                  {network === "threads" && (
                    <span className={`ml-2 font-semibold ${result.length > 500 ? "text-red-500" : "text-[#3aaa78]"}`}>
                      {result.length > 500 ? `⚠ dépasse Threads (+${result.length - 500})` : "✓ limite Threads OK"}
                    </span>
                  )}
                </span>
                <span className="font-serif italic text-[11px] text-gray-400">Visible & Conforme™</span>
              </div>
            )}
          </section>
        )}

        <div className="h-10" />
      </main>
    </div>
  );
}
