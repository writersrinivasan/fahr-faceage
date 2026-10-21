import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Link from "next/link";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const space = Space_Grotesk({ variable: "--font-space", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FAHR · FaceAge Learning Lab",
  // FAHR = Foundation AI models for Health Recognition (Haugg et al., Lancet Digital Health 2026)
  description:
    "Learn how FAHR-Face and FaceAge estimate biological age and cancer survival risk from a face photo, then try it hands-on.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} ${space.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-mesh">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t border-line bg-white/60 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted grid gap-4 md:grid-cols-[2fr_1fr]">
            <p>
              <strong className="text-foreground">Educational use only.</strong> This app explains published research
              on FaceAge (Bontempi et al., <em>The Lancet Digital Health</em>, 2025) and FAHR-Face (Haugg et al., <em>The Lancet
              Digital Health</em>, 2026). The hands-on tools use simulated data and a generic open-source age estimator, not the
              clinical models. Nothing here is medical advice.
            </p>
            <div className="flex gap-4 md:justify-end">
              <Link href="/learn" className="hover:text-violet-700">Learn</Link>
              <Link href="/lab" className="hover:text-violet-700">Lab</Link>
              <Link href="/quiz" className="hover:text-violet-700">Quiz</Link>
              <Link href="/references" className="hover:text-violet-700">References</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
