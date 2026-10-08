"use client";

import { useEffect, useState } from "react";

import { getCurrentUser, logout } from "@/features/auth/api";
import { Dashboard } from "@/features/dashboard/components/dashboard";
import { LoginForm } from "@/features/auth/components/login-form";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsCheckingAuth(false));
  }, []);

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Đang kiểm tra phiên đăng nhập...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <Dashboard
        onLogout={async () => {
          await logout();
          setIsAuthenticated(false);
        }}
      />
    </>
  );
}
