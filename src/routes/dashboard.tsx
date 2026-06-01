import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { session, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !session) {
      void navigate({ to: "/" });
    }
  }, [session, isLoading, navigate]);

  if (isLoading || !session) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
      <p className="text-sm text-gray-500">
        Welcome back{session.user.email ? `, ${session.user.email}` : ""}.
      </p>
    </div>
  );
}
