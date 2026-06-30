import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./_lib/Providers";

export const metadata: Metadata = {
  title: "jemon — Network & Server Dashboard",
  description: "Network and server observability powered by jemon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
