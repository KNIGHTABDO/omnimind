"use client";

import { Navbar } from "@/components/Navbar";

export default function ChangelogPage() {
  const UPDATES = [
    {
      version: "1.2.0",
      date: "May 5, 2026",
      title: "The Multimodal Update",
      description: "Introduced universal file ingestion and visual discovery specialists.",
      changes: [
        "Added document ingestion for .txt, .pdf, .md, and .csv files.",
        "Implemented Moondream-based visual grounding for image understanding.",
        "Upgraded Brain Router to support simultaneous document and image reasoning.",
        "Added high-fidelity Nexus UI document cards for chat history.",
      ],
    },
    {
      version: "1.1.0",
      date: "May 4, 2026",
      title: "Discovery Intelligence",
      description: "Enhanced grounding with real-time web research capabilities.",
      changes: [
        "Integrated Tinyfish Search API for live web discovery.",
        "Implemented Citation Carousel for transparent sourcing.",
        "Added Deep Fetch specialist for full-page context extraction.",
        "Refined 'Thinking' UI with transparent reasoning chains.",
      ],
    },
    {
      version: "1.0.0",
      date: "May 1, 2026",
      title: "OmniMind Launch",
      description: "The official launch of the world's most unified AI orchestrator.",
      changes: [
        "Initial release of the 'One Mind, Every Model' orchestration engine.",
        "Supported GPT-4, Gemini 3, and Llama 3 specialist pools.",
        "Launched the 'Liquid Glass' design system.",
        "Implemented ultra-low latency SSE streaming.",
      ],
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background selection:bg-hero-accent/30">
      <img src="/images/landscape-bg.gif" alt="" className="fixed inset-0 h-full w-full object-cover z-0 opacity-80" />
      <div className="fixed inset-0 bg-gradient-to-t from-background via-transparent to-background/40 z-[1]" />

      <Navbar onBeginJourney={() => {}} showChat={false} />

      <main className="relative z-10 mx-auto max-w-3xl px-6 py-24 sm:py-32">
        <div className="space-y-24 animate-fade-in-up">
          <header className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight text-hero-text" style={{ fontFamily: "var(--font-display)" }}>
              Changelog
            </h1>
            <p className="text-lg text-hero-muted font-light">The evolution of infinite intelligence.</p>
          </header>

          <div className="space-y-32">
            {UPDATES.map((update) => (
              <section key={update.version} className="relative pl-12 border-l border-white/5 space-y-8 group">
                <div className="absolute left-[-5px] top-0 size-2.5 rounded-full bg-hero-accent shadow-[0_0_15px_rgba(56,189,248,0.5)] group-hover:scale-125 transition-transform" />

                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-[10px] font-mono text-hero-muted uppercase tracking-widest">
                    <span>v{update.version}</span>
                    <span className="opacity-20">—</span>
                    <span>{update.date}</span>
                  </div>
                  <h2 className="text-2xl font-medium text-hero-text" style={{ fontFamily: "var(--font-display)" }}>
                    {update.title}
                  </h2>
                </div>

                <div className="space-y-6">
                  <p className="text-sm text-hero-muted leading-relaxed italic">{update.description}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {update.changes.map((change, j) => (
                      <li key={j} className="text-xs text-hero-muted flex gap-3 leading-normal">
                        <span className="text-hero-accent">•</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>

          <footer className="pt-24 border-t border-white/5 text-center">
            <p className="text-xs text-hero-muted uppercase tracking-[0.3em]">OmniMind Foundation © 2026</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
