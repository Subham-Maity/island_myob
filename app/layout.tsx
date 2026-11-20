import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Island Myob — Living Habit World",
  description: "Living Habit Island Design Playground",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}

