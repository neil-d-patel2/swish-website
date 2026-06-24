import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "./use-supabase-auth";

// The owner who can approve users. Also used in the /approvals page and the
// 006_user_approval.sql RLS policies — keep all three in sync if changed.
export const ADMIN_EMAIL = "swishappdev@gmail.com";

export type ApprovalStatus = "pending" | "approved" | "denied";

// Resolves a signed-in Google user's store-access status. On first sign-in it
// creates a 'pending' request and emails the owner once. The owner is always
// treated as approved. Real enforcement lives in Supabase RLS; this drives UX.
export function useApproval() {
  const { session, isLoading: authLoading } = useSupabaseAuth();
  const notify = useAction(api.approvalEmail.notify);
  const [status, setStatus] = useState<ApprovalStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      setStatus(null);
      setIsLoading(false);
      return;
    }

    const user = session.user;
    if (user.email?.toLowerCase() === ADMIN_EMAIL) {
      setStatus("approved");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void (async () => {
      const { data } = await supabase
        .from("user_approvals")
        .select("status")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        setStatus(data.status as ApprovalStatus);
        setIsLoading(false);
        return;
      }

      // First sign-in: create the pending request. The insert only succeeds
      // the first time (primary key on id), so the owner is notified once.
      const { error } = await supabase
        .from("user_approvals")
        .insert({ id: user.id, email: user.email, status: "pending" });

      if (!cancelled) {
        setStatus("pending");
        setIsLoading(false);
      }

      if (!error) {
        try {
          await notify({
            email: user.email ?? "",
            origin: window.location.origin,
          });
        } catch {
          // Notification is best-effort; the request still exists for review.
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, authLoading, notify]);

  return { status, isLoading, isApproved: status === "approved" };
}
