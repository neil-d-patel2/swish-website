import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

// Cream + black design system (shared with pricing/stores)
const cream = "#F6F1E7";
const creamCard = "#FBF8F1";
const creamDeep = "#EFE7D6";
const ink = "#000000";
const muted = "rgba(0,0,0,0.6)";
const heading = "var(--font-heading)";
const body = "var(--font-body)";
const hairline = "inset 0 0 0 1px rgba(0,0,0,0.1)";

const SUBJECTS = [
  "Platform Inquiry",
  "Partnership",
  "Technical Support",
  "Other",
];

type State = "idle" | "loading" | "success" | "error";

function ContactPage() {
  const sendContact = useAction(api.contactEmail.send);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<State>("idle");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (state === "loading" || state === "success") return;
      setState("loading");
      try {
        await sendContact({ name, email, subject, message });
        setState("success");
        setName("");
        setEmail("");
        setSubject(SUBJECTS[0]);
        setMessage("");
        setTimeout(() => setState("idle"), 3000);
      } catch {
        setState("error");
        setTimeout(() => setState("idle"), 3500);
      }
    },
    [name, email, subject, message, state, sendContact],
  );

  const inputClass =
    "w-full rounded-lg px-4 py-3 outline-none transition-shadow focus:ring-1 focus:ring-black";
  const inputStyle = {
    background: creamCard,
    color: ink,
    fontFamily: body,
    boxShadow: hairline,
  } as const;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#E5E7E9", color: ink, fontFamily: body }}
    >
      <div className="px-6 md:px-12 lg:px-16">
        <Navbar variant="light" />
      </div>

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-16">
        {/* Hero */}
        <section className="mb-16 max-w-3xl">
          <h1
            className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight"
            style={{ fontFamily: heading, color: ink }}
          >
            Get in Touch
          </h1>
          <p
            className="text-xl leading-relaxed max-w-2xl"
            style={{ color: muted }}
          >
            We're here to curate your digital growth. Reach out to discuss how
            Swish can elevate your business operations with our bespoke platform
            solutions.
          </p>
        </section>

        {/* Bento grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div
            className="lg:col-span-7 rounded-xl p-8 md:p-12 relative overflow-hidden"
            style={{
              background: "#ffffff",
              boxShadow: `${hairline}, 0 8px 30px rgb(0 0 0 / 0.04)`,
            }}
          >
            <h2
              className="text-2xl font-bold mb-8"
              style={{ fontFamily: heading, color: ink }}
            >
              Send a Message
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium"
                    style={{ fontFamily: body, color: muted }}
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium"
                    style={{ fontFamily: body, color: muted }}
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="subject"
                  className="text-sm font-medium"
                  style={{ fontFamily: body, color: muted }}
                >
                  Subject
                </label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`${inputClass} appearance-none`}
                  style={inputStyle}
                >
                  {SUBJECTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-sm font-medium"
                  style={{ fontFamily: body, color: muted }}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you today?"
                  className={`${inputClass} resize-none`}
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={state === "loading"}
                className="w-full md:w-auto px-8 py-3 rounded-full font-medium shadow-sm hover:shadow-md transition-shadow active:scale-95 duration-200 mt-4 disabled:opacity-80 cursor-pointer"
                style={{ fontFamily: body, color: "#ffffff", background: ink }}
              >
                {state === "loading"
                  ? "Sending..."
                  : state === "success"
                    ? "Inquiry Sent ✓"
                    : "Send Inquiry"}
              </button>

              {state === "error" && (
                <p className="text-sm" style={{ color: "#ba1a1a" }}>
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Direct Lines */}
            <div
              className="rounded-xl p-8"
              style={{ background: "#ffffff", boxShadow: hairline }}
            >
              <h3
                className="text-xl font-bold mb-6"
                style={{ fontFamily: heading, color: ink }}
              >
                Direct Lines
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: cream }}
                  >
                    <Mail className="w-5 h-5" style={{ color: ink }} />
                  </div>
                  <div>
                    <p
                      className="text-sm mb-1"
                      style={{ fontFamily: body, color: muted }}
                    >
                      Email
                    </p>
                    <a
                      href="mailto:swishappdev@gmail.com"
                      className="transition-opacity hover:opacity-60"
                      style={{ color: ink }}
                    >
                      swishappdev@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: cream }}
                  >
                    <Phone className="w-5 h-5" style={{ color: ink }} />
                  </div>
                  <div>
                    <p
                      className="text-sm mb-1"
                      style={{ fontFamily: body, color: muted }}
                    >
                      Phone
                    </p>
                    <a
                      href="tel:+13023101963"
                      className="transition-opacity hover:opacity-60"
                      style={{ color: ink }}
                    >
                      +1 (302) 310 - 1963
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            {/* Headquarters */}
            <div
              className="rounded-xl p-8 flex-grow relative overflow-hidden group"
              style={{ background: creamDeep, boxShadow: hairline }}
            >
              <div
                className="absolute inset-0 opacity-10 mix-blend-multiply bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuANT9inXsX-z8LVIWw8OD3AcZi5YeLeWC_SAYprPxI0_Id6oDBBZV_n7_dWQEkDOpU-qih9o-3EoPyCavQSBtUc8nmobcsIrd5pvZ3vCN9n0hO1kme7CjFzy2DOgz13kocXYk1HQSbUCRl0YlZeWIj6mnb6KUbxN1uibivtIQ5CFrUZfm2j2pSt98nIES7cNuMBnBEwLlrguanD5eFmNfvSxHl3n7nOwJHkTOMLHyVbFfBCY830ZOuHMtgsoJZnveV0rk0td8bSshzP')",
                }}
              />
              <div className="relative z-10">
                <h3
                  className="text-xl font-bold mb-6"
                  style={{ fontFamily: heading, color: ink }}
                >
                  Headquarters
                </h3>
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: "#ffffff" }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: ink }} />
                  </div>
                  <div>
                    <p className="leading-relaxed" style={{ color: ink }}>
                      Johns Hopkins University
                      <br />
                      3400 N. Charles St
                      <br />
                      Baltimore, MD 21218
                    </p>
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 mt-4 text-sm transition-opacity hover:opacity-60 group/link"
                      style={{ fontFamily: body, color: ink }}
                    >
                      Get Directions
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="w-full py-16 border-t mt-auto"
        style={{ background: "#ffffff", borderColor: "rgba(0,0,0,0.1)" }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 lg:px-16 max-w-6xl mx-auto gap-8">
          <div
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: heading, color: ink }}
          >
            Swish
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Security", "Status"].map(
              (l) => (
                <a
                  key={l}
                  href="#"
                  className="text-sm transition-opacity hover:opacity-60"
                  style={{ fontFamily: body, color: muted }}
                >
                  {l}
                </a>
              ),
            )}
          </div>
          <div className="text-sm" style={{ fontFamily: body, color: muted }}>
            © 2026 Swish Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
