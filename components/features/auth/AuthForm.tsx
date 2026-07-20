"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/auth/translateAuthError";

interface AuthFormProps {
  submitLabel: string;
  mode: "login" | "signup";
}

export default function AuthForm({ submitLabel, mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(translateAuthError(error.message));
        } else {
          router.push("/dashboard");
        }
      } else {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
          });
        if (error) {
          setError(translateAuthError(error.message));
        } else {
          setSignupSuccess(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  if (signupSuccess) {
    return (
      <div className="glass-strong rounded-2xl shadow-md p-8 space-y-3 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Duba Imel Ɗinka</h2>
        <p className="text-slate-600 text-sm">
          Mun aika maka hanyar tabbatarwa zuwa <strong>{email}</strong>. Danna ta domin shiga.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-strong rounded-2xl shadow-md p-8 space-y-5"
    >
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
          Adireshin Imel
        </label>
        <input
          id="email"
          type="email"
          placeholder="sunanka@example.com"
          className="w-full rounded-xl border border-white/70 bg-white/50 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition backdrop-blur-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          className="w-full rounded-xl border border-white/70 bg-white/50 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition backdrop-blur-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-yellow-500 hover:bg-yellow-600 py-2.5 text-white font-semibold transition-colors shadow-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Jira..." : submitLabel}
      </button>
    </form>
  );
}
