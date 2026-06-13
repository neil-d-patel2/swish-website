import { createFileRoute } from "@tanstack/react-router";
import { SignInHero } from "@/components/SignInHero";

export const Route = createFileRoute("/")({
  component: SignInHero,
});
