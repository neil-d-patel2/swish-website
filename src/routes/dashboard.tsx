import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function DashboardPage() {
  const { session, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const [storeLoading, setStoreLoading] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: import.meta.env.DEV
          ? window.location.origin
          : "https://neil-d-patel2.github.io/swish-website/",
      },
    });

  useEffect(() => {
    if (!session) return;

    setStoreLoading(true);
    supabase
      .from("stores")
      .select("id")
      .eq("owner_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) void navigate({ to: "/store" });
        setStoreLoading(false);
      });
  }, [session]);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !storeName.trim()) return;

    setCreating(true);
    setError(null);

    const { error } = await supabase
      .from("stores")
      .insert({
        name: storeName.trim(),
        owner_id: session.user.id,
        owner_email: session.user.email,
      });

    if (error) {
      setError(error.message);
      setCreating(false);
    } else {
      void navigate({ to: "/store" });
    }
  };

  if (isLoading) return null;

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="liquid-glass border border-white/10 rounded-2xl px-8 py-10 w-full max-w-sm text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Sign in required</h2>
          <p className="text-sm text-white/50 mb-6">
            You need a Google account to access your dashboard.
          </p>
          <button
            onClick={() => void signInWithGoogle()}
            className="w-full flex items-center justify-center gap-2.5 bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <GoogleIcon />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <p className="text-sm text-white/40 mb-1">{session.user.email}</p>
        <h1 className="text-2xl font-semibold mb-10">Dashboard</h1>

        {storeLoading ? (
          <div className="text-white/40 text-sm">Loading...</div>
        ) : (
          <CreateStoreForm
            storeName={storeName}
            onChange={setStoreName}
            onSubmit={handleCreateStore}
            creating={creating}
            error={error}
          />
        )}
      </div>
    </div>
  );
}

function CreateStoreForm({
  storeName,
  onChange,
  onSubmit,
  creating,
  error,
}: {
  storeName: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  creating: boolean;
  error: string | null;
}) {
  return (
    <div className="liquid-glass border border-white/10 rounded-2xl px-8 py-8">
      <h2 className="text-lg font-semibold mb-1">Create your store</h2>
      <p className="text-sm text-white/40 mb-6">
        Give your store a name. It will appear in the Swish app immediately.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Store name"
          value={storeName}
          onChange={(e) => onChange(e.target.value)}
          disabled={creating}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 disabled:opacity-50"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={creating || !storeName.trim()}
          className="w-full bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {creating ? "Creating..." : "Create store"}
        </button>
      </form>
    </div>
  );
}
