"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, ChevronDown, User } from "lucide-react";

interface TopBarProps {
  user: {
    email: string;
    fullName: string;
    plan: string;
  };
}

export default function TopBar({ user }: TopBarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/connexion");
    router.refresh();
  }

  const displayName = user.fullName || user.email;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-end px-6 shrink-0">
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
        >
          <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xs font-bold">
            {initials || <User className="h-4 w-4" />}
          </div>
          <span className="hidden sm:block max-w-[150px] truncate">
            {displayName}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                  Plan {user.plan}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
