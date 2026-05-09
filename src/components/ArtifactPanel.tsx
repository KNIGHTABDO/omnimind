import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, CodeSquareIcon } from "@hugeicons/core-free-icons";

export function ArtifactPanel({
  isOpen,
  onClose,
  content,
  title = "Generated Artifact"
}: {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title?: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="hidden md:flex fixed right-4 top-24 bottom-24 w-[400px] z-40"
        >
          <div className="liquid-glass w-full h-full rounded-3xl p-6 flex flex-col border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-hero-text/5 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/5">
                  <HugeiconsIcon icon={CodeSquareIcon} className="size-5 text-hero-text" />
                </div>
                <h3 className="text-sm font-bold text-hero-text tracking-wide">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-hero-muted hover:text-hero-text"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs text-hero-text/80 leading-relaxed whitespace-pre-wrap">
                {content}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
