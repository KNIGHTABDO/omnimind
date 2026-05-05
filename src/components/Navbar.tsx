"use client";

import Link from "next/link";

export function Navbar({ onBeginJourney, showChat }: { onBeginJourney: () => void; showChat: boolean }) {
  return (
    <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
      <Link
        href="/"
        className="text-3xl tracking-tight text-hero-text hover:opacity-80 transition-opacity cursor-pointer text-left"
        style={{ fontFamily: "var(--font-display)" }}
      >
        OmniMind<sup className="text-xs">®</sup>
      </Link>

      <div className="hidden md:flex items-center gap-10">
        <Link href="/story" className="text-[10px] font-bold text-hero-muted hover:text-hero-text uppercase tracking-[0.2em] transition-colors">Our Story</Link>
        <Link href="/changelog" className="text-[10px] font-bold text-hero-muted hover:text-hero-text uppercase tracking-[0.2em] transition-colors">Changelog</Link>
        <Link href="/legal" className="text-[10px] font-bold text-hero-muted hover:text-hero-text uppercase tracking-[0.2em] transition-colors">Legal</Link>
      </div>

      {!showChat && (
        <button
          onClick={onBeginJourney}
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-hero-text transition-transform hover:scale-[1.03] cursor-pointer"
        >
          Begin Journey
        </button>
      )}
      {showChat && <div />}
    </nav>
  );
}
