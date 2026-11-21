import type { Metadata } from "next";
import { Fraunces, Bricolage_Grotesque, DM_Mono } from "next/font/google";
import "./globals.css";

// Soft, characterful serif for display type; warm grotesque for UI; quiet mono for data labels.
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-src",
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
  display: "swap",
});
const ui = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-ui-src",
  display: "swap",
});
const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono-src",
  display: "swap",
});

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
    <html lang="en" className={`dark ${display.variable} ${ui.variable} ${mono.variable}`}>
      <body className="text-zinc-100 antialiased selection:bg-amber-300/30 selection:text-amber-100">
        {children}
      </body>
    </html>
  );
}
