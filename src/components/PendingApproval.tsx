import { useNavigate } from "@tanstack/react-router";
import { Clock, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import type { ApprovalStatus } from "@/hooks/use-approval";

const surface = "var(--mk-surface)";
const ink = "var(--mk-ink)";
const muted = "var(--mk-muted)";
const onAccent = "var(--mk-on-accent)";
const heading = "var(--font-heading)";
const body = "var(--font-body)";
const hairline = "var(--mk-hairline)";

// Shown to a signed-in Google user who is not yet approved to create a store.
export function PendingApproval({ status }: { status: ApprovalStatus }) {
  const navigate = useNavigate();
  const denied = status === "denied";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    void navigate({ to: "/" });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--mk-bg)", color: ink, fontFamily: body }}
    >
      <Navbar />

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-20 flex items-center justify-center">
        <div
          className="w-full max-w-xl rounded-2xl px-8 py-12 md:px-12 text-center"
          style={{
            background: surface,
            boxShadow: `${hairline}, 0 8px 30px rgb(0 0 0 / 0.05)`,
          }}
        >
          <div
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "var(--mk-tint)" }}
          >
            {denied ? (
              <XCircle className="h-7 w-7" style={{ color: ink }} />
            ) : (
              <Clock className="h-7 w-7" style={{ color: ink }} />
            )}
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ fontFamily: heading, color: ink }}
          >
            {denied ? "Access not approved" : "You're on the list"}
          </h1>

          <p
            className="text-base leading-relaxed mb-8"
            style={{ color: muted }}
          >
            {denied
              ? "Your request for store access wasn't approved. If you think this is a mistake, reach out to the Swish team."
              : "Your account is awaiting review. We approve new stores by hand to keep quality high — you'll get an email the moment you're in."}
          </p>

          <button
            onClick={() => void handleSignOut()}
            className="px-8 py-3.5 rounded-full font-semibold transition-transform duration-200 cursor-pointer active:scale-[0.98] hover:shadow-lg"
            style={{ fontFamily: body, color: onAccent, background: ink }}
          >
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}
