import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Upload, Plus, Package, DollarSign, Sun, Moon, ImageIcon, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/store")({
  component: StorePage,
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

function StorePage() {
  const { session, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const { light, toggle } = useTheme();
  const [store, setStore] = useState<Store | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!session) { void navigate({ to: "/dashboard" }); return; }

    supabase
      .from("stores")
      .select("*")
      .eq("owner_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) { void navigate({ to: "/dashboard" }); return; }
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

    const inserts = rows.map((row) => {
      const cols = row.split(",");
      const name = cols[0]?.trim() ?? "";
      const price = cols[1] ? parseFloat(cols[1].trim()) : null;
      const stock = cols[2] ? parseInt(cols[2].trim(), 10) : 0;
      return { store_id: store.id, name, price: isNaN(price as number) ? null : price, stock: isNaN(stock) ? 0 : stock, image_url: null };
    }).filter((r) => r.name);

    if (inserts.length === 0) {
      setCsvError("No valid rows found. Make sure columns are: name, price, stock.");
      setCsvImporting(false);
      return;
    }

    const { data, error } = await supabase.from("items").insert(inserts).select();

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
                  <CardDescription className="text-xs uppercase tracking-widest">Total Items</CardDescription>
                  <Package className="w-4 h-4 text-muted-foreground/40" />
                </div>
                <CardTitle className="text-3xl font-semibold">{items.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase tracking-widest">Total Value</CardDescription>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Inventory</h2>
              {items.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="cursor-pointer gap-1.5" onClick={() => csvRef.current?.click()} disabled={csvImporting}>
                    <Upload className="w-3.5 h-3.5" />
                    {csvImporting ? "Importing..." : "Import CSV"}
                  </Button>
                  <Button size="sm" className="cursor-pointer gap-1.5" onClick={() => setDialogOpen(true)}>
                    <Plus className="w-3.5 h-3.5" />
                    Add item
                  </Button>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="flex items-start gap-2 bg-muted border border-border rounded-lg px-4 py-3 text-xs mb-3">
                <span className="text-muted-foreground mt-0.5">ℹ</span>
                <div>
                  <p className="font-medium text-foreground mb-0.5">CSV format</p>
                  <p className="text-muted-foreground">Columns in order: <code className="font-mono bg-background border border-border px-1 py-0.5 rounded">name, price, stock</code> — first row is skipped.</p>
                </div>
              </div>
            )}

            {csvError && (
              <p className="text-sm text-destructive mb-3">{csvError}</p>
            )}

            {items.length === 0 ? (
              <div className="border border-dashed border-border rounded-2xl px-8 py-16 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center mb-5">
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-base font-medium mb-1">No items yet</h3>
                <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                  Add items individually or import a CSV with your full inventory at once.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Button variant="outline" className="cursor-pointer gap-1.5" onClick={() => csvRef.current?.click()} disabled={csvImporting}>
                    <Upload className="w-4 h-4" />
                    {csvImporting ? "Importing..." : "Import CSV"}
                  </Button>
                  <Button className="cursor-pointer gap-1.5" onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Add item
                  </Button>
                </div>
                <div className="mt-5 flex items-start gap-2 bg-muted border border-border rounded-lg px-4 py-3 text-xs text-left max-w-sm">
                  <span className="text-muted-foreground mt-0.5">ℹ</span>
                  <div>
                    <p className="font-medium text-foreground mb-0.5">CSV format</p>
                    <p className="text-muted-foreground">Columns in order: <code className="font-mono bg-background border border-border px-1 py-0.5 rounded">name, price, stock</code></p>
                    <p className="text-muted-foreground mt-0.5">The first row (header) is skipped automatically.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Item</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Stock</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={item.id} className={i < items.length - 1 ? "border-b border-border" : ""}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-9 h-9 rounded-lg object-cover border border-border" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {item.price != null ? `$${item.price.toFixed(2)}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{item.stock}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
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
        </div>

        <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCsvImport} />

        <AddItemDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          storeId={store.id}
          onAdded={handleItemAdded}
        />
      </div>
    </div>
  );
}

function AddItemDialog({
  open,
  onOpenChange,
  storeId,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  storeId: string;
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
    setName(""); setPrice(""); setStock("");
    setImageFile(null); setImagePreview(null); setError(null);
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

      const { data: urlData } = supabase.storage.from("item-images").getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const { data, error: insertError } = await supabase
      .from("items")
      .insert({
        store_id: storeId,
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
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Image picker */}
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full h-32 rounded-xl border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <ImageIcon className="w-6 h-6 text-muted-foreground mb-1.5" />
                <p className="text-xs text-muted-foreground">Click to add image (optional)</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />

          <div className="space-y-1">
            <label className="text-sm font-medium">Name *</label>
            <Input
              placeholder="e.g. Air Force 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Price</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Stock</label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false); }} disabled={saving} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !name.trim()} className="cursor-pointer">
              {saving ? "Adding..." : "Add item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
