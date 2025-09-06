import "./globals.css";
import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PDF Copilot",
  description: "Local, private AI chat for your PDFs. LangChain + Ollama.",
  openGraph: {
    title: "PDF Copilot",
    description: "Local, private AI chat for your PDFs. LangChain + Ollama.",
    url: "http://localhost:3000",
    siteName: "PDF Copilot",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "PDF Copilot" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Copilot",
    description: "Local, private AI chat for your PDFs. LangChain + Ollama.",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <nav className="sticky top-0 z-40 backdrop-blur-xs">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="font-semibold tracking-tight">
              <span className="text-textDim">PDF</span>{" "}
              <span className="text-white">Copilot</span>
            </a>
            <div className="flex gap-2">
              <a className="btn btn-ghost" href="/embed">Chat</a>
              <a className="btn" href="/admin">Admin</a>
            </div>
          </div>
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        </nav>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
