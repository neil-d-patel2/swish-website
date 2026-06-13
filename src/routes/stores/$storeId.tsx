import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Package,
  DollarSign,
  Sun,
  Moon,
  ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const Route = createFileRoute("/stores/$storeId")({
  component: StoreDetailPage,
});

type Store = {
  id: string;
  name: string;
  owner_email: string;
  created_at: string;
};

type Item = {
  id: string;
  store_id: string;
  name: string;
  price: number | null;
  stock: number;
  image_url: string | null;
  created_at: string;
};

function StoreDetailPage() {
  const { storeId } = Route.useParams();
  const navigate = useNavigate();
  const { light, toggle } = useTheme();
  const [store, setStore] = useState<Store | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("stores")
      .select("*")
      .eq("id", storeId)
      .maybeSingle()
      .then(({ data }) => {
        setStore(data);
        if (!data) {
          setLoading(false);
          return;
        }
        supabase
          .from("items")
          .select("*")
          .eq("store_id", storeId)
          .order("created_at", { ascending: false })
          .then(({ data: itemData }) => {
            setItems(itemData ?? []);
            setLoading(false);
          });
      });
  }, [storeId]);

  const totalValue = items.reduce(
    (sum, i) => sum + (i.price ?? 0) * i.stock,
    0,
  );

  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/20 border-t-foreground animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className={light ? "" : "dark"}>
        <div className="min-h-dvh bg-background text-foreground flex flex-col items-center justify-center gap-4 transition-colors duration-200">
          <p className="text-sm text-muted-foreground">Store not found.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void navigate({ to: "/stores" })}
            className="cursor-pointer gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to stores
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={light ? "" : "dark"}>
      <div className="min-h-dvh bg-background text-foreground transition-colors duration-200">
        {/* Header */}
        <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => void navigate({ to: "/stores" })}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Stores
              </button>
              <span className="text-border">|</span>
              <h1 className="text-base font-semibold">{store.name}</h1>
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
                <CardTitle className="text-3xl font-semibold">
                  {items.length}
                </CardTitle>
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
                <CardTitle className="text-3xl font-semibold">
                  ${totalValue.toFixed(2)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Inventory */}
          <div>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
              Inventory
            </h2>

            {items.length === 0 ? (
              <div className="border border-dashed border-border rounded-2xl px-8 py-16 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center mb-5">
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-base font-medium mb-1">No items yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  This store hasn't added any inventory yet.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                        Item
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                        Price
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                        Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr
                        key={item.id}
                        className={
                          i < items.length - 1 ? "border-b border-border" : ""
                        }
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-9 h-9 rounded-lg object-cover border border-border"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {item.price != null
                            ? `$${item.price.toFixed(2)}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {item.stock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
