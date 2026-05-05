"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function OurStoryPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background selection:bg-hero-accent/30">
      <img src="/images/landscape-bg.gif" alt="" className="fixed inset-0 h-full w-full object-cover z-0 opacity-80" />
      <div className="fixed inset-0 bg-gradient-to-t from-background via-transparent to-background/40 z-[1]" />

      <Navbar onBeginJourney={() => {}} showChat={false} />

      <main className="relative z-10 mx-auto max-w-4xl px-6 py-24 sm:py-32">
        <div className="space-y-16 animate-fade-in-up">
          <header className="space-y-6 text-center sm:text-left">
            <h1
              className="text-5xl sm:text-7xl font-medium tracking-tight text-hero-text leading-[1.1]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              One Mind,
              <br />
              <span className="text-hero-muted italic">Every Model.</span>
            </h1>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-24">
            <div className="space-y-8">
              <p className="text-xl text-hero-text leading-relaxed font-light">
                OmniMind was born from a simple realization: intelligence is fragmented. We spend our lives switching between
                tabs, models, and contexts, losing the thread of pure thought.
              </p>
              <p className="text-lg text-hero-muted leading-relaxed">
                We built OmniMind to be the singular point of contact for human potential. A place where the world's most advanced
                AI models don't just exist—they collaborate under a unified consciousness.
              </p>
            </div>

            <div className="space-y-12">
              <div className="p-8 rounded-3xl liquid-glass border border-white/5 space-y-4">
                <h3 className="text-lg font-medium text-hero-text" style={{ fontFamily: "var(--font-display)" }}>
                  The Orchestration Layer
                </h3>
                <p className="text-sm text-hero-muted leading-relaxed">
                  Our proprietary Brain Router doesn't just pick a model; it analyzes intent, detects domain expertise, and
                  dispatches your request to the specialist best suited for the task.
                </p>
              </div>

              <div className="p-8 rounded-3xl liquid-glass border border-white/5 space-y-4">
                <h3 className="text-lg font-medium text-hero-text" style={{ fontFamily: "var(--font-display)" }}>
                  Infinite Discovery
                </h3>
                <p className="text-sm text-hero-muted leading-relaxed">
                  Grounding intelligence in real-world data. With integrated research specialists, OmniMind verifies facts and
                  fetches deep context from across the digital landscape in milliseconds.
                </p>
              </div>
            </div>
          </div>

          <footer className="pt-24 border-t border-white/5 text-center sm:text-left">
            <Link href="/" className="group inline-flex items-center gap-4">
              <div className="size-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                <span className="text-xl">→</span>
              </div>
              <div>
                <p className="text-sm font-medium text-hero-text">Back to Intelligence</p>
                <p className="text-xs text-hero-muted">Start your journey with OmniMind-1</p>
              </div>
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
}
