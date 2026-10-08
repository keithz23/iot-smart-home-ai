"use client";

import { useState, type FormEvent } from "react";
import { Activity, Eye, EyeOff, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/features/auth/api";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password) {
      setError("Vui lòng nhập username và mật khẩu.");
      return;
    }

    if (/\s/.test(username)) {
      setError("Username không được chứa khoảng trắng.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
      onSuccess();
    } catch {
      setError("Username hoặc mật khẩu không chính xác.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="space-y-4 pb-4 pt-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
            <Activity size={24} />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
              Đăng nhập hệ thống
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Smart Home · AI Control Center
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <Label
                htmlFor="username"
                className="text-xs font-medium text-slate-700"
              >
                Username
              </Label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="admin@example.com"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="h-10 rounded-lg border-slate-200 pl-9 pr-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-medium text-slate-700"
              >
                Mật khẩu
              </Label>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-10 rounded-lg border-slate-200 pl-9 pr-10 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus-visible:outline-none"
                  tabIndex={1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 w-full rounded-lg bg-sky-600 text-sm font-medium text-white hover:bg-sky-700"
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
