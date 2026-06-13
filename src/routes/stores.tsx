import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import {
  Package,
  DollarSign,
  Upload,
  Plus,
  Image as ImageIcon,
  Trash2,
  TriangleAlert,
} from "lucide-react";

export const Route = createFileRoute("/stores")({
  component: StoresPage,
});

const items = [
  { name: "Sprite", price: "$1.00", stock: 10 },
  { name: "Hennessy", price: "$25.00", stock: 10 },
  { name: "Macallan 18 Year Old Single Malt", price: "$350.00", stock: 6 },
  { name: "Dom Perignon Brut Champagne", price: "$280.00", stock: 8 },
  { name: "Clase Azul Reposado Tequila", price: "$175.00", stock: 5 },
];

function StoresPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf9fa", color: "#1b1c1d", fontFamily: "'Inter', sans-serif" }}
    >
      <div className="px-6 md:px-12 lg:px-16">
        <Navbar />
      </div>

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-12 flex flex-col gap-12">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#f5f3f4] rounded-xl p-8 flex flex-col justify-between border border-[#e3e2e3] shadow-sm transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start mb-6">
              <h2
                className="text-sm uppercase tracking-wider text-[#434653] font-medium"
                style={{ fontFamily: "'Public Sans', sans-serif" }}
              >
                Total Items
              </h2>
              <Package className="w-5 h-5 text-[#434653]/50" />
            </div>
            <div className="text-5xl font-bold text-[#1b1c1d]" style={{ fontFamily: "'Noto Serif', serif" }}>
              5
            </div>
          </div>
          <div className="bg-[#f5f3f4] rounded-xl p-8 flex flex-col justify-between border border-[#e3e2e3] shadow-sm transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start mb-6">
              <h2
                className="text-sm uppercase tracking-wider text-[#434653] font-medium"
                style={{ fontFamily: "'Public Sans', sans-serif" }}
              >
                Total Value
              </h2>
              <DollarSign className="w-5 h-5 text-[#434653]/50" />
            </div>
            <div className="text-5xl font-bold text-[#1b1c1d]" style={{ fontFamily: "'Noto Serif', serif" }}>
              $5,475.00
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Table Area */}
          <div className="flex-grow w-full lg:w-2/3 flex flex-col gap-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
              <h1
                className="text-2xl font-bold text-[#1b1c1d] tracking-tight"
                style={{ fontFamily: "'Noto Serif', serif" }}
              >
                Inventory
              </h1>
              <div className="flex gap-3">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-[#efedee] rounded-lg text-sm hover:bg-[#e3e2e3] transition-colors border border-[#e3e2e3] cursor-pointer"
                  style={{ fontFamily: "'Public Sans', sans-serif" }}
                >
                  <Upload className="w-[18px] h-[18px]" />
                  Import CSV
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-[#094cb2] text-white rounded-lg text-sm hover:bg-[#094cb2]/90 transition-colors shadow-sm cursor-pointer"
                  style={{ fontFamily: "'Public Sans', sans-serif" }}
                >
                  <Plus className="w-[18px] h-[18px]" />
                  Add item
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl border border-[#e3e2e3] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#e3e2e3] bg-[#f5f3f4]/50">
                      <th
                        className="py-4 px-6 text-xs uppercase tracking-wider text-[#434653] font-medium w-1/2"
                        style={{ fontFamily: "'Public Sans', sans-serif" }}
                      >
                        Item
                      </th>
                      <th
                        className="py-4 px-6 text-xs uppercase tracking-wider text-[#434653] font-medium text-right w-1/4"
                        style={{ fontFamily: "'Public Sans', sans-serif" }}
                      >
                        Price
                      </th>
                      <th
                        className="py-4 px-6 text-xs uppercase tracking-wider text-[#434653] font-medium text-right w-1/4"
                        style={{ fontFamily: "'Public Sans', sans-serif" }}
                      >
                        Stock
                      </th>
                      <th className="py-4 px-6 w-10" />
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-[#e3e2e3]">
                    {items.map((item) => (
                      <tr key={item.name} className="hover:bg-[#f5f3f4]/30 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#efedee] flex items-center justify-center border border-[#e3e2e3]">
                              <ImageIcon className="w-5 h-5 text-[#434653]/50" />
                            </div>
                            <span className="font-medium text-[#1b1c1d]">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right tabular-nums text-[#434653]">{item.price}</td>
                        <td className="py-4 px-6 text-right tabular-nums text-[#434653]">{item.stock}</td>
                        <td className="py-4 px-6 text-right">
                          <button className="text-[#434653]/40 hover:text-[#ba1a1a] transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-1/3 lg:pt-[52px]">
            <div className="bg-[#f5f3f4] rounded-xl p-6 border border-[#e3e2e3] shadow-sm lg:sticky lg:top-28">
              <h3
                className="text-lg font-bold text-[#1b1c1d] mb-4"
                style={{ fontFamily: "'Noto Serif', serif" }}
              >
                CSV tips
              </h3>
              <div className="space-y-4 text-sm text-[#434653]">
                <p>Columns must be in this order:</p>
                <div className="bg-white p-3 rounded-lg border border-[#e3e2e3] font-mono text-xs text-[#1b1c1d]">
                  name, price, stock
                </div>
                <p>The first row is treated as a header and skipped.</p>
                <div className="mt-6 bg-[#bfab49]/20 border border-[#6d5e00]/30 rounded-lg p-4 flex gap-3 items-start">
                  <TriangleAlert className="w-5 h-5 text-[#6d5e00] mt-0.5 shrink-0" />
                  <p className="text-[#4a3f00] font-medium leading-relaxed">
                    Omit the $ — use plain numbers only (e.g. 9.99).
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-16 bg-white border-t border-[#e3e2e3] mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 lg:px-16 max-w-6xl mx-auto gap-8">
          <div className="text-2xl font-bold text-[#1b1c1d] tracking-tight" style={{ fontFamily: "'Noto Serif', serif" }}>
            Swish
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Security", "Status"].map((label) => (
              <a
                key={label}
                href="#"
                className="text-[#434653] hover:text-[#094cb2] transition-colors text-sm"
                style={{ fontFamily: "'Public Sans', sans-serif" }}
              >
                {label}
              </a>
            ))}
          </div>
          <div className="text-sm text-[#434653]" style={{ fontFamily: "'Public Sans', sans-serif" }}>
            © 2026 Swish Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
