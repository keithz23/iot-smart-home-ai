"use client";

import { useState } from "react";

import { Dashboard } from "@/features/dashboard/components/dashboard";
import { LoginForm } from "@/features/auth/components/login-form";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <Dashboard />;
}
