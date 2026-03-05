"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        return;
      }

      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "#1a1d2e" }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-white"
            style={{ backgroundColor: "#10b981" }}
          >
            F
          </div>
          <span className="text-xl font-semibold text-gray-900">
            Fortify Property
          </span>
        </div>

        {/* Heading */}
        <h1 className="mb-1 text-center text-2xl font-bold text-gray-900">
          Welcome back
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Sign in to your account to continue
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#10b981" }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center text-xs text-gray-500">
          <span className="font-medium text-gray-600">Demo:</span>{" "}
          demo@fortifyproperty.com / demo1234
        </div>
      </div>
    </div>
  );
}
