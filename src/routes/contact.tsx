import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#050508" }}
    >
      <div className="text-center px-6">
        <h1
          className="text-4xl md:text-5xl font-normal text-white mb-6"
          style={{ letterSpacing: "-0.04em" }}
        >
          Get in touch
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Interested in Swish? Message us and we'll get back to you.
        </p>
        <a
          href="mailto:npate137@jh.edu"
          className="inline-block bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors text-lg"
        >
          npate137@jh.edu
        </a>
        <p className="text-gray-500 text-sm mt-4">
          Message if interested.
        </p>
      </div>
    </div>
  );
}
