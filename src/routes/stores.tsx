import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/stores")({
  component: StoresPage,
});

function StoresPage() {
  return <div>Stores</div>;
}
