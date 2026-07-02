import type { Metadata } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { ThemeStyles } from "@jemon/ui/theme";
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
    <html lang="ko" className="dark">
      <head>
        <ThemeStyles />
      </head>
      <body className="min-h-screen bg-page font-sans text-on-surface antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
