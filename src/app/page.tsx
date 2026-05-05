"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ChatView } from "@/components/ChatView";

export default function HomePage() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <img src="/images/landscape-bg.gif" alt="" className="absolute inset-0 h-full w-full object-cover z-0" />
      <div className="absolute inset-0 bg-background/60 z-[1]" />

      <Navbar onBeginJourney={() => setShowChat(true)} showChat={showChat} />

      {!showChat ? <HeroSection onBeginJourney={() => setShowChat(true)} /> : <ChatView />}
    </div>
  );
}

