export function HeroSection({ onBeginJourney }: { onBeginJourney: () => void }) {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40">
      <h1
        className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl text-hero-text animate-fade-rise"
        style={{ fontFamily: "var(--font-display)" }}
      >
        One Mind, Every Model
      </h1>
      <p className="text-base sm:text-lg max-w-2xl mt-8 leading-relaxed text-hero-muted animate-fade-rise-delay">
        Every AI model, unified under one name — OmniMind-1. No switching, no
        guessing, no limits. Just pure intelligence, ready when you are.
      </p>
      <button
        onClick={onBeginJourney}
        className="liquid-glass rounded-full px-14 py-5 text-base text-hero-text mt-12 transition-transform hover:scale-[1.03] cursor-pointer animate-fade-rise-delay-2"
      >
        Begin Journey
      </button>
    </section>
  );
}