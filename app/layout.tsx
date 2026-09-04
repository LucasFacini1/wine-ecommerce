import type { Metadata } from "next";
import { Fraunces, Newsreader, Mona_Sans } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "opsz"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const monaSans = Mona_Sans({
  variable: "--font-mona",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Empório Padox — vinhos de produtor",
    template: "%s · Empório Padox",
  },
  description:
    "Uma seleção pequena e teimosa de vinhos de produtor. Tintos, brancos, espumantes e curiosidades, garimpados safra a safra.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${newsreader.variable} ${monaSans.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <div className="grain" aria-hidden />
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
