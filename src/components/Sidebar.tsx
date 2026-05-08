import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, Settings01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 w-80 max-w-full z-50 p-4"
          >
            <div className="liquid-glass w-full h-full rounded-3xl p-6 flex flex-col border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl text-hero-text" style={{ fontFamily: "var(--font-display)" }}>
                  OmniMind Settings
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-hero-muted hover:text-hero-text"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-8 no-scrollbar">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-hero-muted uppercase tracking-[0.2em] mb-4">
                    <HugeiconsIcon icon={Clock01Icon} className="size-4" />
                    History
                  </div>
                  <div className="space-y-2">
                    {/* Placeholder for history items */}
                    <div className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-sm text-hero-text/80 truncate">
                      Building the Masterpiece UI
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-sm text-hero-text/80 truncate">
                      Fluid Animations with Framer Motion
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-hero-muted uppercase tracking-[0.2em] mb-4">
                    <HugeiconsIcon icon={Settings01Icon} className="size-4" />
                    Preferences
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs text-hero-muted ml-1">Copilot Token</label>
                      <input
                        type="password"
                        placeholder="gho_..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-hero-text placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-sm text-hero-text/80">Web Search</span>
                      <div className="w-8 h-4 bg-white/20 rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-hero-text rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
