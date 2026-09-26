import "~/styles/globals.css";

import { type Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "MittiMadhur | Pure Jaggery for a Healthier Tomorrow",
  description:
    "Naturally sweet, chemical-free jaggery sourced from trusted Indian farmers and delivered across India.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
