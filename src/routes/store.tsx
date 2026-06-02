import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Upload, Plus, Package, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/8 bg-black/60 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">{store.name}</h1>
            <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-sm text-white/30 hidden sm:block">{store.owner_email}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/[0.03] border-white/10 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-white/40 text-xs uppercase tracking-widest">
                  Total Items
                </CardDescription>
                <Package className="w-4 h-4 text-white/20" />
              </div>
              <CardTitle className="text-3xl font-semibold mt-1">0</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-white/[0.03] border-white/10 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-white/40 text-xs uppercase tracking-widest">
                  Total Value
                </CardDescription>
                <DollarSign className="w-4 h-4 text-white/20" />
              </div>
              <CardTitle className="text-3xl font-semibold mt-1">$0.00</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Items section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white/60 uppercase tracking-widest">
              Inventory
            </h2>
          </div>

          {/* Empty state */}
          <div className="border border-dashed border-white/10 rounded-2xl px-8 py-16 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
              <Package className="w-6 h-6 text-white/30" />
            </div>
            <h3 className="text-base font-medium mb-1">No items yet</h3>
            <p className="text-sm text-white/40 mb-8 max-w-xs">
              Add items to your store individually, or import a CSV with your full inventory at once.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="outline"
                className="bg-transparent border-white/15 text-white hover:bg-white/5 hover:border-white/25 gap-2 cursor-pointer transition-all duration-200"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </Button>
              <Button
                className="bg-white text-black hover:bg-white/90 gap-2 cursor-pointer transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add item
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
