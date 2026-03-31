import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Severity } from "@/types/audit";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scoreToGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

export function severityColor(severity: Severity): string {
  switch (severity) {
    case "error":
      return "text-red-600 bg-red-50 border-red-200";
    case "warning":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "info":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "success":
      return "text-zen-600 bg-zen-50 border-zen-200";
  }
}

export function severityLabel(severity: Severity): string {
  switch (severity) {
    case "error":
      return "Critique";
    case "warning":
      return "Avertissement";
    case "info":
      return "Information";
    case "success":
      return "Conforme";
  }
}

export function riskLevelLabel(
  level: "faible" | "modere" | "eleve" | "critique"
): string {
  switch (level) {
    case "faible":
      return "Risque faible";
    case "modere":
      return "Risque modéré";
    case "eleve":
      return "Risque élevé";
    case "critique":
      return "Risque critique";
  }
}

export function riskLevelColor(
  level: "faible" | "modere" | "eleve" | "critique"
): string {
  switch (level) {
    case "faible":
      return "text-zen-700 bg-zen-100";
    case "modere":
      return "text-amber-700 bg-amber-100";
    case "eleve":
      return "text-orange-700 bg-orange-100";
    case "critique":
      return "text-red-700 bg-red-100";
  }
}

export function truncateUrl(url: string, maxLength = 50): string {
  if (url.length <= maxLength) return url;
  return url.slice(0, maxLength) + "…";
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function absoluteUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  return `${base}${path}`;
}
