import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/stores")({
  component: StoresPage,
});

function StoresPage() {
  return (
    <div className="text-white min-h-screen flex items-center justify-center" style={{ background: "#07060f" }}>
      <div className="text-center">
        <Link to="/" className="text-2xl font-semibold tracking-tight text-white">
          Swish
        </Link>
        <h1 className="text-4xl font-normal text-white mt-6" style={{ letterSpacing: "-0.04em" }}>
          Stores
        </h1>
      </div>
    </div>
  );
}
