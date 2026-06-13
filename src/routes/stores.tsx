import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Store as StoreIcon, ImageIcon, Package } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/stores")({
  component: StoresPage,
});

// Cream + black design system (shared with pricing/contact)
const cream = "#F6F1E7";
const creamCard = "#FBF8F1";
const creamDeep = "#EFE7D6";
const ink = "#000000";
const muted = "rgba(0,0,0,0.6)";
const heading = "var(--font-heading)";
const body = "var(--font-body)";
const hairline = "inset 0 0 0 1px rgba(0,0,0,0.1)";

type Store = {
  id: string;
  name: string;
  created_at: string;
};

type Item = {
  id: string;
  name: string;
  price: number | null;
  stock: number;
  image_url: string | null;
};

function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Store | null>(null);

  useEffect(() => {
    supabase
      .from("stores")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        const list = data ?? [];
        setStores(list);
        setLoading(false);
        // Item counts per store (best-effort, doesn't block render)
        const { data: itemRows } = await supabase.from("items").select("store_id");
        if (itemRows) {
          const tally: Record<string, number> = {};
          for (const row of itemRows as { store_id: string }[]) {
            tally[row.store_id] = (tally[row.store_id] ?? 0) + 1;
          }
          setCounts(tally);
        }
      });
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: cream, color: ink, fontFamily: body }}
    >
      <div className="px-6 md:px-12 lg:px-16">
        <Navbar variant="light" />
      </div>

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-16">
        {selected ? (
          <StoreDetail store={selected} onBack={() => setSelected(null)} />
        ) : (
          <>
            {/* Hero */}
            <section className="mb-14 max-w-3xl">
              <h1
                className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight"
                style={{ fontFamily: heading, color: ink }}
              >
                Stores
              </h1>
              <p className="text-xl leading-relaxed max-w-2xl" style={{ color: muted }}>
                Browse every store on Swish. Open any one to explore its full
                catalog — items, live stock, and pricing.
              </p>
            </section>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div
                  className="w-5 h-5 rounded-full border-2 animate-spin"
                  style={{ borderColor: "rgba(0,0,0,0.15)", borderTopColor: ink }}
                />
              </div>
            ) : stores.length === 0 ? (
              <EmptyState
                icon={<StoreIcon className="w-6 h-6" style={{ color: muted }} />}
                title="No stores yet"
                blurb="Once stores join Swish, they'll appear here for everyone to browse."
              />
            ) : (
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => setSelected(store)}
                    className="group text-left rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                    style={{
                      background: "#ffffff",
                      boxShadow: `${hairline}, 0 8px 30px rgb(0 0 0 / 0.04)`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                      style={{ background: cream, boxShadow: hairline }}
                    >
                      <StoreIcon className="w-5 h-5" style={{ color: ink }} />
                    </div>
                    <h3
                      className="text-2xl font-bold tracking-tight mb-6 truncate"
                      style={{ fontFamily: heading, color: ink }}
                    >
                      {store.name}
                    </h3>
                    <div className="mt-auto flex items-center justify-between">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                        style={{ background: creamDeep, color: muted }}
                      >
                        <Package className="w-3.5 h-3.5" />
                        {counts[store.id] ?? 0} item
                        {(counts[store.id] ?? 0) === 1 ? "" : "s"}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-sm font-medium transition-opacity opacity-60 group-hover:opacity-100"
                        style={{ color: ink }}
                      >
                        View
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </button>
                ))}
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer
        className="w-full py-16 border-t mt-auto"
        style={{ background: "#ffffff", borderColor: "rgba(0,0,0,0.1)" }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 lg:px-16 max-w-6xl mx-auto gap-8">
          <div
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: heading, color: ink }}
          >
            Swish
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Security", "Status"].map(
              (l) => (
                <a
                  key={l}
                  href="#"
                  className="text-sm transition-opacity hover:opacity-60"
                  style={{ fontFamily: body, color: muted }}
                >
                  {l}
                </a>
              ),
            )}
          </div>
          <div className="text-sm" style={{ fontFamily: body, color: muted }}>
            © 2026 Swish Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function StoreDetail({ store, onBack }: { store: Store; onBack: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("items")
      .select("id, name, price, stock, image_url")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems((data as Item[]) ?? []);
        setLoading(false);
      });
  }, [store.id]);

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium mb-8 transition-opacity hover:opacity-60 cursor-pointer"
        style={{ color: muted }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to stores
      </button>

      {/* Store header */}
      <section className="mb-12 flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: creamDeep, boxShadow: hairline }}
        >
          <StoreIcon className="w-7 h-7" style={{ color: ink }} />
        </div>
        <div className="min-w-0">
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight truncate"
            style={{ fontFamily: heading, color: ink }}
          >
            {store.name}
          </h1>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div
            className="w-5 h-5 rounded-full border-2 animate-spin"
            style={{ borderColor: "rgba(0,0,0,0.15)", borderTopColor: ink }}
          />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Package className="w-6 h-6" style={{ color: muted }} />}
          title="No items yet"
          blurb="This store hasn't added any items to its catalog."
        />
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: "#ffffff",
                boxShadow: `${hairline}, 0 8px 30px rgb(0 0 0 / 0.04)`,
              }}
            >
              {/* Image */}
              <div
                className="aspect-[4/3] w-full flex items-center justify-center overflow-hidden"
                style={{ background: cream }}
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8" style={{ color: "rgba(0,0,0,0.2)" }} />
                )}
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-grow">
                <h3
                  className="text-lg font-semibold tracking-tight mb-3 truncate"
                  style={{ fontFamily: heading, color: ink }}
                >
                  {item.name}
                </h3>
                <div className="mt-auto flex items-center justify-between">
                  <span
                    className="text-xl font-bold"
                    style={{ fontFamily: heading, color: ink }}
                  >
                    {item.price != null ? `$${item.price.toFixed(2)}` : "—"}
                  </span>
                  <StockBadge stock={item.stock} />
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  const out = stock <= 0;
  const low = stock > 0 && stock <= 5;
  const color = out ? "#ba1a1a" : low ? "#9a6700" : "rgba(0,0,0,0.6)";
  const bg = out
    ? "rgba(186,26,26,0.08)"
    : low
      ? "rgba(154,103,0,0.1)"
      : creamDeep;
  return (
    <span
      className="text-xs font-medium px-3 py-1.5 rounded-full"
      style={{ background: bg, color }}
    >
      {out ? "Out of stock" : `${stock} in stock`}
    </span>
  );
}

function EmptyState({
  icon,
  title,
  blurb,
}: {
  icon: React.ReactNode;
  title: string;
  blurb: string;
}) {
  return (
    <div
      className="rounded-2xl px-8 py-20 flex flex-col items-center text-center"
      style={{ background: creamCard, boxShadow: hairline }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "#ffffff", boxShadow: hairline }}
      >
        {icon}
      </div>
      <h3
        className="text-xl font-bold mb-2"
        style={{ fontFamily: heading, color: ink }}
      >
        {title}
      </h3>
      <p className="text-sm max-w-xs" style={{ color: muted }}>
        {blurb}
      </p>
    </div>
  );
}
