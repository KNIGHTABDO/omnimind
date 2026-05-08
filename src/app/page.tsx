import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ChatView } from "@/components/ChatView";
import { Sidebar } from "@/components/Sidebar";
import { AnimatePresence, motion } from "framer-motion";

export default function HomePage() {
  const [showChat, setShowChat] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <motion.img
        src="/images/landscape-bg.gif"
        alt=""
        className="absolute inset-0 h-full w-full object-cover z-0"
        animate={{
          scale: showChat ? 1.05 : 1,
          filter: showChat ? "blur(4px) brightness(0.8)" : "blur(0px) brightness(1)"
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-background/60 z-[1]" />

      <Navbar onBeginJourney={() => setShowChat(true)} showChat={showChat} onToggleSidebar={() => setShowSidebar(true)} />
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

      <AnimatePresence mode="wait">
        {!showChat ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)", scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="relative z-10 h-full"
          >
            <HeroSection onBeginJourney={() => setShowChat(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 40, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="relative z-10 h-[calc(100vh-88px)]"
          >
            <ChatView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
