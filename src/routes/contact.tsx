import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="text-white min-h-screen" style={{ background: "#07060f" }}>
      <div className="relative w-full min-h-screen overflow-hidden flex flex-col">

        {/* Animated ambient blobs */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(115,66,226,0.18) 0%, transparent 65%)",
            top: "-15%",
            left: "-10%",
            filter: "blur(60px)",
            animation: "drift1 18s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 550,
            height: 550,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 65%)",
            bottom: "-10%",
            right: "-8%",
            filter: "blur(60px)",
            animation: "drift2 22s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(115,66,226,0.08) 0%, transparent 70%)",
            top: "50%",
            left: "60%",
            filter: "blur(50px)",
            animation: "drift1 26s ease-in-out infinite alternate-reverse",
          }}
        />
        <style>{`
          @keyframes drift1 {
            from { transform: translate(0, 0); }
            to   { transform: translate(40px, 30px); }
          }
          @keyframes drift2 {
            from { transform: translate(0, 0); }
            to   { transform: translate(-35px, -25px); }
          }
        `}</style>

        {/* Content layer */}
        <div className="relative z-10 flex flex-col min-h-screen px-6 md:px-12 lg:px-16">

          {/* Navbar */}
          <Navbar />

        </div>
      </div>
    </div>
  );
}
