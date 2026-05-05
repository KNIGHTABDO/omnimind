"use client";

import { Navbar } from "@/components/Navbar";

export default function LegalPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background selection:bg-hero-accent/30">
      <img src="/images/landscape-bg.gif" alt="" className="fixed inset-0 h-full w-full object-cover z-0 opacity-80" />
      <div className="fixed inset-0 bg-gradient-to-t from-background via-transparent to-background/40 z-[1]" />

      <Navbar onBeginJourney={() => {}} showChat={false} />

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-24 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 animate-fade-in-up">
          <aside className="lg:col-span-1 space-y-8">
            <h1 className="text-3xl font-medium text-hero-text" style={{ fontFamily: "var(--font-display)" }}>
              Legal
            </h1>
            <nav className="flex flex-col gap-4">
              <a href="#privacy" className="text-[10px] font-bold text-hero-accent uppercase tracking-widest hover:opacity-80 transition-opacity">
                Privacy Policy
              </a>
              <a href="#terms" className="text-[10px] font-bold text-hero-muted uppercase tracking-widest hover:text-hero-text transition-colors">
                Terms of Service
              </a>
              <a href="#compliance" className="text-[10px] font-bold text-hero-muted uppercase tracking-widest hover:text-hero-text transition-colors">
                AI Ethics
              </a>
            </nav>
          </aside>

          <div className="lg:col-span-3 space-y-24 pb-32">
            <section id="privacy" className="space-y-8">
              <h2 className="text-2xl font-medium text-hero-text" style={{ fontFamily: "var(--font-display)" }}>
                Privacy Policy
              </h2>
              <div className="prose prose-invert prose-sm max-w-none text-hero-muted leading-relaxed space-y-6">
                <p>
                  At OmniMind, your privacy is the cornerstone of our intelligence. We operate on a principle of maximum
                  transparency and minimal data persistence.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-y border-white/5">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-hero-text uppercase tracking-wider">Data Encryption</h4>
                    <p className="text-[12px]">All conversations are encrypted in transit and at rest using AES-256 standards.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-hero-text uppercase tracking-wider">Zero Training</h4>
                    <p className="text-[12px]">OmniMind does NOT use your personal conversations to train underlying models.</p>
                  </div>
                </div>
                <p>
                  We only retain the metadata necessary to maintain your session and orchestrate your request to specialized pools.
                  You own your data. Always.
                </p>
              </div>
            </section>

            <section id="terms" className="space-y-8 pt-8">
              <h2 className="text-2xl font-medium text-hero-text" style={{ fontFamily: "var(--font-display)" }}>
                Terms of Service
              </h2>
              <div className="prose prose-invert prose-sm max-w-none text-hero-muted leading-relaxed space-y-6">
                <p>
                  By using OmniMind, you agree to leverage infinite intelligence responsibly. We provide access to a unified
                  orchestration layer for research and creative purposes.
                </p>
                <ul className="list-none space-y-4">
                  {[
                    "Prohibited usage includes harmful content generation.",
                    "Fair use limits apply to specialist pools.",
                    "OmniMind is not liable for specialist model hallucinations.",
                    "API access is granted under individual license terms.",
                  ].map((term, i) => (
                    <li
                      key={i}
                      className="flex gap-4 items-center p-4 rounded-xl bg-white/5 border border-white/5 text-[12px]"
                    >
                      <span className="text-hero-accent font-mono">0{i + 1}</span>
                      {term}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section id="compliance" className="space-y-8 pt-8">
              <h2 className="text-2xl font-medium text-hero-text" style={{ fontFamily: "var(--font-display)" }}>
                AI Ethics
              </h2>
              <div className="prose prose-invert prose-sm max-w-none text-hero-muted leading-relaxed space-y-6">
                <p>
                  Intelligence without ethics is merely noise. OmniMind is committed to the development of "Safe-by-Design"
                  orchestration layers that prioritize human alignment.
                </p>
                <div className="p-8 rounded-3xl liquid-glass border border-white/5 space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-hero-accent uppercase tracking-[0.2em]">01. Human Centricity</h4>
                    <p className="text-[13px] text-hero-text">
                      We ensure that every automated decision remains under human oversight and serves to augment, rather than
                      replace, human creativity.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-hero-accent uppercase tracking-[0.2em]">02. Model Neutrality</h4>
                    <p className="text-[13px] text-hero-text">
                      Our orchestration engine remains unbiased, presenting the results of specialized models without hidden
                      filtering or algorithmic preference.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-hero-accent uppercase tracking-[0.2em]">03. Factual Grounding</h4>
                    <p className="text-[13px] text-hero-text">
                      We combat misinformation by prioritizing models and specialist tools that offer transparent citations and
                      verifiable web-grounded data.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <footer className="pt-12 border-t border-white/5">
              <p className="text-[10px] text-hero-muted font-mono uppercase tracking-[0.2em]">Last Updated: May 5, 2026</p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
