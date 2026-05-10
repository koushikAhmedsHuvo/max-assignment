import type { Metadata } from "next";
import { Amiri, Inter, Scheherazade_New } from "next/font/google";
import { FontSettingsProvider } from "@/src/context/FontSettingsContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

const scheherazade = Scheherazade_New({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-scheherazade",
});

export const metadata: Metadata = {
  title: "Quran Web Reader",
  description: "Quran reading web app inspired by QuranMazid.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${amiri.variable} ${scheherazade.variable}`}
    >
      <body className="min-h-screen">
        <FontSettingsProvider>{children}</FontSettingsProvider>
      </body>
    </html>
  );
}
