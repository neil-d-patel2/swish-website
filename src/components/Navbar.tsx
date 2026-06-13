import { Link } from "@tanstack/react-router";

export function Navbar() {
  return (
    <div className="pt-6">
      <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
        <Link to="/" className="text-2xl font-semibold tracking-tight text-white">
          Swish
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm text-white transition-colors hover:text-gray-300">
            Home
          </Link>
          <Link to="/dashboard" className="text-sm text-white transition-colors hover:text-gray-300">
            Dashboard
          </Link>
          <Link to="/stores" className="text-sm text-white transition-colors hover:text-gray-300">
            Stores
          </Link>
        </div>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back
        </Link>
      </nav>
    </div>
  );
}
