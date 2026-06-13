import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  Upload,
  Plus,
  Package,
  DollarSign,
  ImageIcon,
  Trash2,
  Store as StoreIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { Navbar } from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/store")({
  component: StorePage,
});

// Cream + black design system (shared with pricing/contact/stores)
const cream = "var(--mk-cream)";
const creamCard = "var(--mk-cream-card)";
const creamDeep = "var(--mk-cream-deep)";
const ink = "var(--mk-ink)";
const muted = "var(--mk-muted)";
const surface = "var(--mk-surface)";
const onAccent = "var(--mk-on-accent)";
const faint = "var(--mk-faint)";
const heading = "var(--font-heading)";
const body = "var(--font-body)";
const hairline = "var(--mk-hairline)";
const danger = "#ba1a1a";

const inkBtnClass =
  "inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
const inkBtnStyle = { background: ink, color: onAccent, fontFamily: body } as const;
const outlineBtnClass =
  "inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all active:scale-95 duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
const outlineBtnStyle = {
  background: surface,
  color: ink,
  fontFamily: body,
  boxShadow: hairline,
} as const;

const fieldClass =
  "w-full rounded-lg px-4 py-3 outline-none transition-shadow focus:ring-1 focus:ring-black disabled:opacity-60";
const fieldStyle = {
  background: creamCard,
  color: ink,
  fontFamily: body,
  boxShadow: hairline,
} as const;

type Store = {
  id: string;
  name: string;
  owner_email: string;
  created_at: string;
};

type Item = {
  id: string;
  store_id: string;
  store_email: string | null;
  store_name: string | null;
  name: string;
  price: number | null;
  stock: number;
  image_url: string | null;
  created_at: string;
};

function StorePage() {
  const { session, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const csvRef = useRef<HTMLInputElement>(null);

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
          return;
        }
        setStore(data);
        setStoreLoading(false);
        // Load items for this store
        supabase
          .from("items")
          .select("*")
          .eq("store_id", data.id)
          .order("created_at", { ascending: false })
          .then(({ data: itemData }) => setItems(itemData ?? []));
      });
  }, [session, isLoading]);

  const handleItemAdded = (item: Item) => {
    setItems((prev) => [item, ...prev]);
    setDialogOpen(false);
  };

  const handleDeleteItem = async (id: string) => {
    await supabase.from("items").delete().eq("id", id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !store) return;

    setCsvError(null);
    setCsvImporting(true);

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    // Skip header row
    const rows = lines.slice(1);

    if (rows.length === 0) {
      setCsvError("CSV has no data rows.");
      setCsvImporting(false);
      return;
    }

    const inserts = rows
      .map((row) => {
        const cols = row.split(",");
        const name = cols[0]?.trim() ?? "";
        const price = cols[1] ? parseFloat(cols[1].trim()) : null;
        const stock = cols[2] ? parseInt(cols[2].trim(), 10) : 0;
        return {
          store_id: store.id,
          store_email: store.owner_email,
          store_name: store.name,
          name,
          price: isNaN(price as number) ? null : price,
          stock: isNaN(stock) ? 0 : stock,
          image_url: null,
        };
      })
      .filter((r) => r.name);

    if (inserts.length === 0) {
      setCsvError(
        "No valid rows found. Make sure columns are: name, price, stock.",
      );
      setCsvImporting(false);
      return;
    }

    const { data, error } = await supabase
      .from("items")
      .insert(inserts)
      .select();

    if (error) {
      setCsvError(error.message);
    } else if (data) {
      setItems((prev) => [...(data as Item[]), ...prev]);
    }

    setCsvImporting(false);
  };

  const totalValue = items.reduce((sum, i) => sum + (i.price ?? 0) * i.stock, 0);

  if (isLoading || storeLoading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{ background: cream }}
      >
        <div
          className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--mk-tint-strong)", borderTopColor: ink }}
        />
      </div>
    );
  }

  if (!store) return null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: cream, color: ink, fontFamily: body }}
    >
      <div className="px-6 md:px-12 lg:px-16">
        <Navbar variant="light" />
      </div>

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-16">
        {/* Store header */}
        <section className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: creamDeep, boxShadow: hairline }}
            >
              <StoreIcon className="w-7 h-7" style={{ color: ink }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1
                  className="text-4xl md:text-5xl font-bold tracking-tight truncate"
                  style={{ fontFamily: heading, color: ink }}
                >
                  {store.name}
                </h1>
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full shrink-0"
                  style={{
                    background: "rgba(22,163,74,0.1)",
                    color: "#15803d",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "#16a34a" }}
                  />
                  Online
                </span>
              </div>
              <p className="text-sm mt-1.5 truncate" style={{ color: muted }}>
                {store.owner_email}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14">
          <StatCard
            label="Total Items"
            value={String(items.length)}
            icon={<Package className="w-4 h-4" style={{ color: faint }} />}
          />
          <StatCard
            label="Total Value"
            value={`$${totalValue.toFixed(2)}`}
            icon={<DollarSign className="w-4 h-4" style={{ color: faint }} />}
          />
        </section>

        {/* Inventory */}
        <section>
          <div className="flex items-center justify-between mb-6 gap-4">
            <h2
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: heading, color: ink }}
            >
              Inventory
            </h2>
            {items.length > 0 && (
              <div className="flex gap-3">
                <button
                  className={`${outlineBtnClass} text-sm !px-4 !py-2`}
                  style={outlineBtnStyle}
                  onClick={() => csvRef.current?.click()}
                  disabled={csvImporting}
                >
                  <Upload className="w-4 h-4" />
                  {csvImporting ? "Importing…" : "Import CSV"}
                </button>
                <button
                  className={`${inkBtnClass} text-sm !px-4 !py-2`}
                  style={inkBtnStyle}
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add item
                </button>
              </div>
            )}
          </div>

          {csvError && (
            <p
              className="text-sm rounded-lg px-4 py-3 mb-4"
              style={{
                color: danger,
                background: "rgba(186,26,26,0.08)",
                boxShadow: "inset 0 0 0 1px rgba(186,26,26,0.2)",
              }}
            >
              {csvError}
            </p>
          )}

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1 min-w-0 w-full">
              {items.length === 0 ? (
                <div
                  className="rounded-2xl px-8 py-20 flex flex-col items-center text-center"
                  style={{ background: creamCard, boxShadow: hairline }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: surface, boxShadow: hairline }}
                  >
                    <Package className="w-6 h-6" style={{ color: muted }} />
                  </div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ fontFamily: heading, color: ink }}
                  >
                    No items yet
                  </h3>
                  <p className="text-sm max-w-xs mb-8" style={{ color: muted }}>
                    Add items individually or import a CSV with your full
                    inventory at once.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      className={outlineBtnClass}
                      style={outlineBtnStyle}
                      onClick={() => csvRef.current?.click()}
                      disabled={csvImporting}
                    >
                      <Upload className="w-4 h-4" />
                      {csvImporting ? "Importing…" : "Import CSV"}
                    </button>
                    <button
                      className={inkBtnClass}
                      style={inkBtnStyle}
                      onClick={() => setDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Add item
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: surface,
                    boxShadow: `${hairline}, 0 8px 30px rgb(0 0 0 / 0.04)`,
                  }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: creamDeep }}>
                        <th
                          className="text-left px-5 py-3.5 font-medium text-xs uppercase tracking-widest"
                          style={{ color: muted }}
                        >
                          Item
                        </th>
                        <th
                          className="text-right px-5 py-3.5 font-medium text-xs uppercase tracking-widest"
                          style={{ color: muted }}
                        >
                          Price
                        </th>
                        <th
                          className="text-right px-5 py-3.5 font-medium text-xs uppercase tracking-widest"
                          style={{ color: muted }}
                        >
                          Stock
                        </th>
                        <th className="px-5 py-3.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr
                          key={item.id}
                          style={
                            i < items.length - 1
                              ? { boxShadow: "inset 0 -1px 0 var(--mk-border)" }
                              : undefined
                          }
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                  style={{ boxShadow: hairline }}
                                />
                              ) : (
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                                  style={{ background: cream, boxShadow: hairline }}
                                >
                                  <ImageIcon
                                    className="w-4 h-4"
                                    style={{ color: faint }}
                                  />
                                </div>
                              )}
                              <span className="font-medium" style={{ color: ink }}>
                                {item.name}
                              </span>
                            </div>
                          </td>
                          <td
                            className="px-5 py-3.5 text-right tabular-nums font-medium"
                            style={{ color: ink }}
                          >
                            {item.price != null
                              ? `$${item.price.toFixed(2)}`
                              : "—"}
                          </td>
                          <td
                            className="px-5 py-3.5 text-right tabular-nums"
                            style={{ color: item.stock <= 0 ? danger : muted }}
                          >
                            {item.stock <= 0 ? "Out" : item.stock}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              aria-label={`Delete ${item.name}`}
                              className="inline-flex items-center justify-center rounded-md p-1.5 transition-colors cursor-pointer hover:bg-black/[0.04]"
                              style={{ color: muted }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.color = danger)
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color = muted)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* CSV tips */}
            <aside
              className="w-full lg:w-72 shrink-0 rounded-2xl p-6"
              style={{ background: creamCard, boxShadow: hairline }}
            >
              <h3
                className="text-base font-bold mb-4"
                style={{ fontFamily: heading, color: ink }}
              >
                CSV tips
              </h3>
              <div className="space-y-3 text-sm" style={{ color: muted }}>
                <p>Columns must be in this order:</p>
                <code
                  className="block font-mono text-xs px-3 py-2 rounded-lg"
                  style={{ background: surface, color: ink, boxShadow: hairline }}
                >
                  name, price, stock
                </code>
                <p>The first row is treated as a header and skipped.</p>
                <div
                  className="flex gap-2 rounded-lg px-3 py-2.5"
                  style={{
                    background: "rgba(154,103,0,0.08)",
                    color: "#9a6700",
                    boxShadow: "inset 0 0 0 1px rgba(154,103,0,0.2)",
                  }}
                >
                  <p>
                    Omit the <code className="font-mono">$</code> — use plain
                    numbers only (e.g. <code className="font-mono">9.99</code>).
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <input
        ref={csvRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleCsvImport}
      />

      <AddItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        storeId={store.id}
        storeEmail={store.owner_email}
        storeName={store.name}
        onAdded={handleItemAdded}
      />

      {/* Footer */}
      <footer
        className="w-full py-16 border-t mt-auto"
        style={{ background: surface, borderColor: "var(--mk-border)" }}
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

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-7"
      style={{
        background: surface,
        boxShadow: `${hairline}, 0 8px 30px rgb(0 0 0 / 0.04)`,
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <span
          className="text-xs uppercase tracking-widest font-medium"
          style={{ color: muted }}
        >
          {label}
        </span>
        {icon}
      </div>
      <p
        className="text-4xl font-bold tabular-nums"
        style={{ fontFamily: heading, color: ink }}
      >
        {value}
      </p>
    </div>
  );
}

function AddItemDialog({
  open,
  onOpenChange,
  storeId,
  storeEmail,
  storeName,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  storeId: string;
  storeEmail: string;
  storeName: string;
  onAdded: (item: Item) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setName("");
    setPrice("");
    setStock("");
    setImageFile(null);
    setImagePreview(null);
    setError(null);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);

    let image_url: string | null = null;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${storeId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(path, imageFile, { upsert: true });

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("item-images")
        .getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const { data, error: insertError } = await supabase
      .from("items")
      .insert({
        store_id: storeId,
        store_email: storeEmail,
        store_name: storeName,
        name: name.trim(),
        price: price ? parseFloat(price) : null,
        stock: stock ? parseInt(stock, 10) : 0,
        image_url,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    reset();
    onAdded(data);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        style={{ background: surface, color: ink, fontFamily: body }}
      >
        <DialogTitle
          className="text-xl font-bold"
          style={{ fontFamily: heading, color: ink }}
        >
          Add item
        </DialogTitle>
        <DialogDescription style={{ color: muted }}>
          Add a product to your store's live catalog.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Image picker */}
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full h-32 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden"
            style={{
              background: creamCard,
              boxShadow: "inset 0 0 0 1px var(--mk-border)",
            }}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <ImageIcon
                  className="w-6 h-6 mb-1.5"
                  style={{ color: muted }}
                />
                <p className="text-xs" style={{ color: muted }}>
                  Click to add image (optional)
                </p>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImage}
          />

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium"
              style={{ color: muted }}
            >
              Name <span style={{ color: danger }}>*</span>
            </label>
            <input
              placeholder="e.g. Air Force 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              required
              className={fieldClass}
              style={fieldStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium"
                style={{ color: muted }}
              >
                Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={saving}
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium"
                style={{ color: muted }}
              >
                Stock
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                disabled={saving}
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm" style={{ color: danger }}>
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={saving}
              className={`${outlineBtnClass} !px-5 !py-2.5 text-sm`}
              style={outlineBtnStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className={`${inkBtnClass} !px-5 !py-2.5 text-sm`}
              style={inkBtnStyle}
            >
              {saving ? "Adding…" : "Add item"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
