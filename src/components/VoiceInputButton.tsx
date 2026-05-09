"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mic01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export function VoiceInputButton() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="relative flex items-center justify-center">
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: 120 }}
            exit={{ opacity: 0, scale: 0.8, width: 0 }}
            className="absolute right-full mr-2 h-8 liquid-glass rounded-full flex items-center justify-center gap-1 px-3 overflow-hidden origin-right"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-hero-text rounded-full"
                animate={{
                  height: ["20%", "80%", "20%"],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        variant="ghost"
        className={`rounded-full hover:bg-secondary/50 transition-colors z-10 ${isRecording ? 'text-hero-text bg-white/10' : 'text-hero-muted hover:text-hero-text'}`}
        onMouseDown={() => setIsRecording(true)}
        onMouseUp={() => setIsRecording(false)}
        onMouseLeave={() => setIsRecording(false)}
        onTouchStart={() => setIsRecording(true)}
        onTouchEnd={() => setIsRecording(false)}
      >
        <HugeiconsIcon icon={Mic01Icon} className="size-4" />
      </Button>
    </div>
  );
}
