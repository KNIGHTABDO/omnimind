import "./globals.css";

export const metadata = {
  title: "OmniMind — One Mind, Every Model",
  description: "Chat with every AI model at maximum capacity. One interface, one name, infinite intelligence.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

