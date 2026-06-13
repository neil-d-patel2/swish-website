import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/stores")({
  component: StoresPage,
});


function StoresPage() {
  return (
    <div className="text-white min-h-screen" style={{ background: "#07060f" }}>
      <div className="px-6 md:px-12 lg:px-16">
        <Navbar />
      </div>
      <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 88px)" }}>
        <div className="text-center">
          <Link to="/" className="text-2xl font-semibold tracking-tight text-white">
            Swish
          </Link>
          <h1 className="text-4xl font-normal text-white mt-6" style={{ letterSpacing: "-0.04em" }}>
            Stores
          </h1>
        </div>
      </div>
    </div>
  );
}
