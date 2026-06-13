import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

const serif = "'Noto Serif', serif";
const body = "'Inter', sans-serif";
const label = "'Public Sans', sans-serif";

// inset 1px ring used across the theme's cards/inputs
const ghostBorder = "inset 0 0 0 1px rgba(195,198,213,0.15)";

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
    "w-full rounded-lg px-4 py-3 outline-none transition-shadow focus:ring-1 focus:ring-[#094cb2]";
  const inputStyle = {
    background: "#faf9fa",
    color: "#1b1c1d",
    fontFamily: body,
    boxShadow: ghostBorder,
  } as const;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf9fa", color: "#1b1c1d", fontFamily: body }}
    >
      <div className="px-6 md:px-12 lg:px-16">
        <Navbar />
      </div>

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-16">
        {/* Hero */}
        <section className="mb-16 max-w-3xl">
          <h1
            className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight"
            style={{ fontFamily: serif, color: "#1b1c1d" }}
          >
            Get in Touch
          </h1>
          <p
            className="text-xl leading-relaxed max-w-2xl"
            style={{ color: "#434653" }}
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
              boxShadow: `${ghostBorder}, 0 8px 30px rgb(0 0 0 / 0.04)`,
            }}
          >
            <h2
              className="text-2xl font-bold mb-8"
              style={{ fontFamily: serif, color: "#1b1c1d" }}
            >
              Send a Message
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium"
                    style={{ fontFamily: label, color: "#434653" }}
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
                    style={{ fontFamily: label, color: "#434653" }}
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
                  style={{ fontFamily: label, color: "#434653" }}
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
                  style={{ fontFamily: label, color: "#434653" }}
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
                style={{
                  fontFamily: body,
                  color: "#ffffff",
                  background:
                    state === "success"
                      ? "#6d5e00"
                      : "linear-gradient(90deg, #094cb2, #3366cc)",
                }}
              >
                {state === "loading"
                  ? "Sending..."
                  : state === "success"
                    ? "Inquiry Sent"
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
              style={{ background: "#f5f3f4", boxShadow: ghostBorder }}
            >
              <h3
                className="text-xl font-bold mb-6"
                style={{ fontFamily: serif, color: "#1b1c1d" }}
              >
                Direct Lines
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "#efedee" }}
                  >
                    <Mail className="w-5 h-5" style={{ color: "#094cb2" }} />
                  </div>
                  <div>
                    <p
                      className="text-sm mb-1"
                      style={{ fontFamily: label, color: "#434653" }}
                    >
                      Email
                    </p>
                    <a
                      href="mailto:swishappdev@gmail.com"
                      className="transition-colors hover:text-[#094cb2]"
                      style={{ color: "#1b1c1d" }}
                    >
                      swishappdev@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "#efedee" }}
                  >
                    <Phone className="w-5 h-5" style={{ color: "#094cb2" }} />
                  </div>
                  <div>
                    <p
                      className="text-sm mb-1"
                      style={{ fontFamily: label, color: "#434653" }}
                    >
                      Phone
                    </p>
                    <a
                      href="tel:+13023101963"
                      className="transition-colors hover:text-[#094cb2]"
                      style={{ color: "#1b1c1d" }}
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
              style={{ background: "#dbdadb", boxShadow: ghostBorder }}
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
                  style={{ fontFamily: serif, color: "#1b1c1d" }}
                >
                  Headquarters
                </h3>
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: "#ffffff" }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: "#094cb2" }} />
                  </div>
                  <div>
                    <p className="leading-relaxed" style={{ color: "#1b1c1d" }}>
                      Wyman Park Building, Suite 100
                      <br />
                      3400 N. Charles St
                      <br />
                      Baltimore, MD 21218
                    </p>
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 mt-4 text-sm transition-colors group/link"
                      style={{ fontFamily: label, color: "#094cb2" }}
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
        style={{ background: "#ffffff", borderColor: "#e3e2e3" }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 lg:px-16 max-w-6xl mx-auto gap-8">
          <div
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: serif, color: "#1b1c1d" }}
          >
            Swish
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Security", "Status"].map(
              (l) => (
                <a
                  key={l}
                  href="#"
                  className="text-sm transition-colors hover:text-[#094cb2]"
                  style={{ fontFamily: label, color: "#434653" }}
                >
                  {l}
                </a>
              ),
            )}
          </div>
          <div
            className="text-sm"
            style={{ fontFamily: label, color: "#434653" }}
          >
            © 2026 Swish Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
