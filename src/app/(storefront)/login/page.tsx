"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="glass-panel-strong rounded-3xl p-8">
        <div className="flex items-center gap-2 text-[var(--accent)]">
          <BookOpen className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Welcome Back
          </span>
        </div>
        <h1 className="font-editorial mt-2 text-3xl font-semibold text-[var(--text-primary)]">
          Sign In
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Email
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="reader@folioandspine.com"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Password
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" /> {error}
            </p>
          )}

          <Button
            type="submit"
            variant="accent"
            size="lg"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="mt-6 rounded-2xl border border-[var(--border-glass)] bg-[var(--surface-subtle)] p-4 text-xs text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--text-primary)]">
            Demo Credentials
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail("reader@folioandspine.com");
                setPassword("reader1234");
              }}
              className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-1.5 font-medium hover:border-[var(--accent)] cursor-pointer"
            >
              Fill Customer
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("admin@folioandspine.com");
                setPassword("admin1234");
              }}
              className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-1.5 font-medium hover:border-[var(--accent)] cursor-pointer"
            >
              Fill Admin
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          New to Folio &amp; Spine?{" "}
          <Link
            href="/register"
            className="font-semibold text-[var(--accent)] hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
