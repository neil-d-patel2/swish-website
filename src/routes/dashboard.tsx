import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

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
  const { light, toggle } = useTheme();
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

  return (
    <div className={light ? "" : "dark"}>
      <div className="min-h-dvh bg-background text-foreground transition-colors duration-200">
        {/* Header */}
        <div className="border-b border-border">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={() => void navigate({ to: "/" })} className="text-sm font-medium cursor-pointer hover:opacity-70 transition-opacity">Swish</button>
            <Button variant="outline" size="sm" onClick={toggle} className="cursor-pointer gap-1.5">
              {light ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              {light ? "Dark" : "Light"}
            </Button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-20">
          {!session ? (
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl font-semibold mb-2">Sign in required</h2>
              <p className="text-sm text-muted-foreground mb-8">
                You need a Google account to access your dashboard.
              </p>
              <Button
                onClick={() => void signInWithGoogle()}
                variant="outline"
                className="gap-2.5 cursor-pointer"
              >
                <GoogleIcon />
                Sign in with Google
              </Button>
            </div>
          ) : storeLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-1">{session.user.email}</p>
              <h1 className="text-2xl font-semibold mb-10">Dashboard</h1>
              <Card>
                <CardHeader>
                  <CardTitle>Create your store</CardTitle>
                  <CardDescription>
                    Give your store a name. It will appear in the Swish app immediately.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateStore} className="flex flex-col gap-4">
                    <Input
                      type="text"
                      placeholder="Store name"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      disabled={creating}
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button
                      type="submit"
                      disabled={creating || !storeName.trim()}
                      className="cursor-pointer"
                    >
                      {creating ? "Creating..." : "Create store"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
