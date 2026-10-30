import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sea View Skydiving — Tandem Jump over Pattaya | Greedy Adventures",
  description: "Experience a premier coastal tandem skydive from 13,000 ft over Pattaya with USPA-certified instructors and Gulf of Thailand ocean views.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col font-sans bg-brand-sand text-slate-800 antialiased selection:bg-brand-amber selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-teal focus:text-white focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-amber"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
