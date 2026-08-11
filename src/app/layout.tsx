import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from "@/components/common/toast-provider";
import { QueryProvider } from "@/components/common/query-provider";

/** Self-hosted so the build has no network dependency on Google Fonts.
 *  Outfit is a variable font — one file covers the whole 300-700 range. */
const outfit = localFont({
  variable: "--font-outfit",
  display: "swap",
  preload: true,
  src: [
    {
      path: "./fonts/Outfit-latin.woff2",
      weight: "300 700",
      style: "normal",
    },
    {
      path: "./fonts/Outfit-latin-ext.woff2",
      weight: "300 700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Career College",
  description: "Career-focused college programs and admissions information.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${outfit.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
