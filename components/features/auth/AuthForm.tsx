"use client";

import { useState } from "react";

interface AuthFormProps {
  submitLabel: string;
}

export default function AuthForm({ submitLabel }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Placeholder submit- input values:", { email, password });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-strong rounded-2xl shadow-md p-8 space-y-5"
    >
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
          Email address
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
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

      <button
        type="submit"
        className="w-full rounded-xl bg-yellow-500 hover:bg-yellow-600 py-2.5 text-white font-semibold transition-colors shadow-sm mt-2"
      >
        {submitLabel}
      </button>
    </form>
  );
}
