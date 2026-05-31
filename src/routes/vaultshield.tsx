import { createFileRoute } from "@tanstack/react-router";
import { VaultShieldHero } from "@/components/VaultShieldHero";

export const Route = createFileRoute("/vaultshield")({
  component: VaultShieldHero,
});
