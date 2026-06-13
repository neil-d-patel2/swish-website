import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Store as StoreIcon, ChevronRight, Sun, Moon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const Route = createFileRoute("/stores/")({
  component: StoresPage,
});

type Store = {
  id: string;
  name: string;
  owner_email: string;
  created_at: string;
};

function StoresPage() {
  const navigate = useNavigate();
  const { light, toggle } = useTheme();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("stores")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setStores(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className={light ? "" : "dark"}>
      <div className="min-h-dvh bg-background text-foreground transition-colors duration-200">
        {/* Header */}
        <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => void navigate({ to: "/" })}
                className="text-base font-bold tracking-tight cursor-pointer hover:opacity-70 transition-opacity duration-150"
              >
                Swish
              </button>
              <span className="text-border">|</span>
              <h1 className="text-base font-semibold">Stores</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggle}
              className="cursor-pointer gap-1.5"
            >
              {light ? (
                <Moon className="w-3.5 h-3.5" />
              ) : (
                <Sun className="w-3.5 h-3.5" />
              )}
              {light ? "Dark" : "Light"}
            </Button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/20 border-t-foreground animate-spin" />
            </div>
          ) : stores.length === 0 ? (
            <div className="border border-dashed border-border rounded-2xl px-8 py-16 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center mb-5">
                <StoreIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium mb-1">No stores yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Stores will show up here once owners register them.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((store) => (
                <Card
                  key={store.id}
                  className="cursor-pointer hover:ring-foreground/20 transition-colors"
                  onClick={() =>
                    void navigate({
                      to: "/stores/$storeId",
                      params: { storeId: store.id },
                    })
                  }
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center">
                          <StoreIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <CardTitle>{store.name}</CardTitle>
                          <CardDescription>{store.owner_email}</CardDescription>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
