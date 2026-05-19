import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Send, Users } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const entries = useQuery(api.waitlist.list);
  const broadcast = useAction(api.waitlistBroadcast.send);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [sentCount, setSentCount] = useState(0);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setStatus("sending");
    try {
      const result = await broadcast({ subject: subject.trim(), message: message.trim() });
      setSentCount(result.sent);
      setStatus("done");
      setSubject("");
      setMessage("");
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      <h2 className="text-xl font-semibold mb-6">Waitlist Admin</h2>

      {/* Stats */}
      <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/30 mb-8">
        <Users className="w-5 h-5 text-muted-foreground shrink-0" />
        <div>
          <p className="text-2xl font-bold leading-none">
            {entries === undefined ? "—" : entries.length}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">emails on the waitlist</p>
        </div>
      </div>

      {/* Broadcast form */}
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Swish is launching next week 🚀"
            required
            className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={"Hi there,\n\nWe're excited to share..."}
            required
            rows={7}
            className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-y font-mono"
          />
          <p className="text-xs text-muted-foreground mt-1">Plain text. Line breaks are preserved.</p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button
            type="submit"
            disabled={status === "sending" || !subject.trim() || !message.trim()}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {status === "sending"
              ? "Sending…"
              : `Send to ${entries?.length ?? "all"} subscribers`}
          </Button>

          {status === "done" && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              ✓ Sent to {sentCount} {sentCount === 1 ? "person" : "people"}.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-destructive">Failed to send. Check your Resend API key.</p>
          )}
        </div>
      </form>
    </div>
  );
}
