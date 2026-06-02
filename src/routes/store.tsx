import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Upload, Plus, Package, DollarSign, Sun, Moon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const Route = createFileRoute("/store")({
  component: StorePage,
});

type Store = {
  id: string;
  name: string;
  owner_email: string;
  created_at: string;
};

function StorePage() {
  const { session, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const { light, toggle } = useTheme();
  const [store, setStore] = useState<Store | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      void navigate({ to: "/dashboard" });
      return;
    }

    supabase
      .from("stores")
      .select("*")
      .eq("owner_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          void navigate({ to: "/dashboard" });
        } else {
          setStore(data);
        }
        setStoreLoading(false);
      });
  }, [session, isLoading]);

  if (isLoading || storeLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/20 border-t-foreground animate-spin" />
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className={light ? "" : "dark"}>
      <div className="min-h-dvh bg-background text-foreground transition-colors duration-200">
        {/* Header */}
        <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold">{store.name}</h1>
              <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
                Live
              </span>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground hidden sm:block">{store.owner_email}</p>
              <Button variant="outline" size="sm" onClick={toggle} className="cursor-pointer gap-1.5">
                {light ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                {light ? "Dark" : "Light"}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase tracking-widest">
                    Total Items
                  </CardDescription>
                  <Package className="w-4 h-4 text-muted-foreground/40" />
                </div>
                <CardTitle className="text-3xl font-semibold">0</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase tracking-widest">
                    Total Value
                  </CardDescription>
                  <DollarSign className="w-4 h-4 text-muted-foreground/40" />
                </div>
                <CardTitle className="text-3xl font-semibold">$0.00</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Inventory section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Inventory
              </h2>
            </div>

            {/* Empty state */}
            <div className="border border-dashed border-border rounded-2xl px-8 py-16 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center mb-5">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium mb-1">No items yet</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                Add items individually or import a CSV with your full inventory at once.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button variant="outline" className="cursor-pointer">
                  <Upload />
                  Import CSV
                </Button>
                <Button className="cursor-pointer">
                  <Plus />
                  Add item
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
