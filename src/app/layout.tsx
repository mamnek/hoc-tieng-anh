import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { KeepAlive } from "@/components/layout/keep-alive";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "VocabMaster - Học Từ Vựng Tiếng Anh",
  description: "Ứng dụng học từ vựng tiếng Anh thông minh và hiệu quả",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <KeepAlive />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
