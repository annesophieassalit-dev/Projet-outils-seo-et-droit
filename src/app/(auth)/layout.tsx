import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="py-4 px-6 border-b border-gray-100 bg-white">
        <Link href="/" className="inline-flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-zen-700" />
          <span className="font-bold text-gray-900">LexZen</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-gray-400">
        © 2024 LexZen · Vos données sont sécurisées
      </footer>
    </div>
  );
}
