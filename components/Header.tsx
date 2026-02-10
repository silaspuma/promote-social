"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setAuthenticated(!!user);
      setLoading(false);
    }

    checkAuth();
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-black">
            promote<span className="text-blue-600">.social</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/browse"
              className="text-gray-700 hover:text-black transition"
            >
              Browse Tasks
            </Link>
            {authenticated && (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-black transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-black transition"
                >
                  Profile
                </Link>
              </>
            )}
            {!loading && !authenticated && (
              <Link
                href="/auth/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
