import "~/styles/globals.css";

import { type Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://mittimadhur.in"),
  title: {
    default: "MittiMadhur | Pure Jaggery for a Healthier Tomorrow",
    // Page titles render as "Shop Jaggery | MittiMadhur".
    template: "%s | MittiMadhur",
  },
  description:
    "Naturally sweet, chemical-free jaggery sourced from trusted Indian farmers and delivered across India.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    type: "website",
    siteName: "MittiMadhur",
    locale: "en_IN",
  },
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable}`}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <a
          href="#main"
          className="bg-brown sr-only rounded-full px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60]"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
