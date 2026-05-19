import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArrowRight, CheckCircle } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VIOLET = "139,92,246";

type State = "idle" | "loading" | "success" | "duplicate" | "error";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const joinWaitlist = useMutation(api.waitlist.join);

  // Spring glow on input focus
  const [{ glow }, glowApi] = useSpring(() => ({
    glow: 0,
    config: { tension: 280, friction: 24 },
  }));

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (state === "loading" || state === "success") return;
      setState("loading");
      try {
        await joinWaitlist({ email });
        setState("success");
        setEmail("");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        setState(msg === "already_registered" ? "duplicate" : "error");
        setTimeout(() => setState("idle"), 3500);
      }
    },
    [email, state, joinWaitlist],
  );

  const MESSAGE: Record<Exclude<State, "idle" | "loading">, string> = {
    success: "You're on the list! We'll be in touch soon.",
    duplicate: "That email is already registered.",
    error: "Something went wrong. Please try again.",
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {state === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
            className="flex items-center gap-3 justify-center px-5 py-3.5 rounded-xl border border-emerald-500/25"
            style={{ background: "rgba(16,185,129,0.06)" }}
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-sm text-emerald-300">{MESSAGE.success}</span>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex flex-col sm:flex-row gap-2"
          >
            {/* Input with spring glow */}
            <div className="relative flex-1">
              <animated.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  boxShadow: glow.to(
                    (g) => `0 0 0 1px rgba(${VIOLET},${g * 0.5}), 0 0 ${g * 20}px rgba(${VIOLET},${g * 0.12})`,
                  ),
                }}
              />
              <input
                ref={inputRef}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => glowApi.start({ glow: 1 })}
                onBlur={() => glowApi.start({ glow: 0 })}
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none border border-white/[0.08] bg-white/[0.04] transition-colors focus:border-white/[0.15]"
              />
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={state === "loading"}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-black text-sm font-semibold shrink-0 disabled:opacity-60 cursor-pointer"
              style={{
                boxShadow: state === "idle" ? undefined : "none",
              }}
            >
              {state === "loading" ? (
                <motion.div
                  className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  Join waitlist
                  <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                </>
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Error / duplicate message */}
      <AnimatePresence>
        {(state === "duplicate" || state === "error") && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-2 text-center text-xs text-red-400/80"
          >
            {MESSAGE[state]}
          </motion.p>
        )}
      </AnimatePresence>

      <p className="mt-3 text-center text-[11px] text-white/20">
        No spam. Unsubscribe any time.
      </p>
    </div>
  );
}
