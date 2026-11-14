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
  const [role, setRole] = useState<"student" | "instructor">("student");
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
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(translateAuthError(error.message));
        } else {
          const role = data.user?.user_metadata?.role;
          router.push(role === "instructor" ? "/instructor" : "/courses");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/confirm`,
              data: { role },
            },
          });
        if (error) {
          setError(translateAuthError(error.message));
        } else {
          // Best-effort: signup itself succeeded, so an upsert failure only
          // gets logged and never blocks the success panel
          if (data.user?.id) {
            const { error: upsertError } = await supabase
              .from("users")
              .upsert({ id: data.user.id, role }, { onConflict: "id" });
            if (upsertError) {
              console.error("[AuthForm] role upsert failed:", upsertError.message);
            }
          }
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

      {mode === "signup" && (
        <div>
          <span className="block text-sm font-medium text-slate-700 mb-1.5">
            Wanene kai?
          </span>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm cursor-pointer transition backdrop-blur-sm ${
                role === "student"
                  ? "border-yellow-400 bg-yellow-50/60 text-slate-900 ring-2 ring-yellow-400"
                  : "border-white/70 bg-white/50 text-slate-700"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="student"
                checked={role === "student"}
                onChange={() => setRole("student")}
                className="accent-yellow-500"
              />
              I&apos;m a student
            </label>
            <label
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm cursor-pointer transition backdrop-blur-sm ${
                role === "instructor"
                  ? "border-yellow-400 bg-yellow-50/60 text-slate-900 ring-2 ring-yellow-400"
                  : "border-white/70 bg-white/50 text-slate-700"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="instructor"
                checked={role === "instructor"}
                onChange={() => setRole("instructor")}
                className="accent-yellow-500"
              />
              I&apos;m an instructor
            </label>
          </div>
        </div>
      )}

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
