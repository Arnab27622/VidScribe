/**
 * Root Layout Component.
 * Defines the skeleton of every page, including fonts, SEO metadata, 
 * and the ThemeProvider for Dark/Light mode.
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO (Search Engine Optimization) metadata
export const metadata: Metadata = {
  title: "VidScribe - AI-Powered YouTube Video Summarizer",
  description: "Get instant AI summaries, key topics, and full transcripts for any YouTube video. Free, fast, and powered by Gemini AI.",
  keywords: ["youtube summarizer", "video transcription", "AI summary", "youtube transcript", "video to text"],
  authors: [{ name: "VidScribe" }],
  openGraph: {
    title: "VidScribe - AI YouTube Summarizer",
    description: "Get instant AI summaries for any YouTube video. Extract key topics and full transcripts in seconds.",
    type: "website",
    locale: "en_US",
    siteName: "VidScribe",
  },
  twitter: {
    card: "summary_large_image",
    title: "VidScribe - AI YouTube Summarizer",
    description: "Get instant AI summaries for any YouTube video",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
