import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Sun, Moon, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { session, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const { light, toggle } = useTheme();
  const [storeLoading, setStoreLoading] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The dashboard is gated: signed-out visitors go back to the home hero.
  useEffect(() => {
    if (!isLoading && !session) void navigate({ to: "/" });
  }, [isLoading, session, navigate]);

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
    const { error } = await supabase.from("stores").insert({
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

  if (isLoading || !session) return null;

  const emailPrefix = session.user.email?.split("@")[0] ?? "";

  return (
    <div
      className={light ? "" : "dark"}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="relative min-h-dvh bg-background text-foreground transition-colors duration-200 overflow-hidden">
        {/* Decorative background gradients */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className={`absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.12] blur-3xl transition-colors duration-500 ${
              light ? "bg-green-400" : "bg-green-600"
            }`}
          />
          <div
            className={`absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.08] blur-3xl transition-colors duration-500 ${
              light ? "bg-emerald-300" : "bg-emerald-800"
            }`}
          />
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-border/60 bg-background/70 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => void navigate({ to: "/" })}
              className="text-base font-bold tracking-tight cursor-pointer hover:opacity-70 transition-opacity duration-150"
            >
              Swish
            </button>
            <div className="flex items-center gap-3">
              {session?.user.email && (
                <span className="hidden sm:block text-sm text-muted-foreground">
                  {session.user.email}
                </span>
              )}
              <button
                onClick={toggle}
                aria-label="Toggle theme"
                className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-150 ${
                  light
                    ? "text-gray-500 hover:text-gray-900 hover:bg-black/[0.06]"
                    : "text-white/45 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                {light ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </button>
              {session && (
                <button
                  onClick={() => void supabase.auth.signOut()}
                  className={`text-sm font-medium cursor-pointer transition-colors duration-150 ${
                    light
                      ? "text-gray-400 hover:text-gray-900"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100dvh-65px)] px-6 py-16">
          {storeLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading your store…
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md"
            >
              {/* Welcome text */}
              <div className="mb-8">
                <p
                  className={`text-sm font-medium mb-1 ${light ? "text-green-700" : "text-green-400"}`}
                >
                  Welcome{emailPrefix ? `, ${emailPrefix}` : ""}
                </p>
                <h1 className="text-3xl font-bold tracking-tight">
                  Set up your store
                </h1>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Your store name appears in the Swish app and is visible to
                  customers when they search.
                </p>
              </div>

              {/* Glass card */}
              <div
                className={`rounded-2xl border p-6 shadow-sm transition-colors duration-200 ${
                  light
                    ? "bg-white/80 backdrop-blur-xl border-black/[0.07]"
                    : "bg-white/[0.04] backdrop-blur-xl border-white/[0.07]"
                }`}
              >
                <form
                  onSubmit={handleCreateStore}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="store-name" className="text-sm font-medium">
                      Store name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="store-name"
                      type="text"
                      placeholder="e.g. Jordan's Kicks"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      disabled={creating}
                      autoFocus
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all duration-150 ${
                        light
                          ? "bg-gray-50 border-black/10 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          : "bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      } disabled:opacity-50`}
                    />
                    <p className="text-xs text-muted-foreground">
                      You can change this later from your store settings.
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={creating || !storeName.trim()}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-150 bg-green-600 text-white hover:bg-green-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating your store…
                      </>
                    ) : (
                      <>
                        Create store
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Reassurance text */}
              <p className="text-center text-xs text-muted-foreground mt-4">
                Takes less than 30 seconds. No credit card required.
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
