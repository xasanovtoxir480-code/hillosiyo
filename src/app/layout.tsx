import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PickUp Market — Toshkent | Yashirin Ombor",
  description: "Bozor narxidan arzon, navbat yo'q, toza va saralangan mahsulotlar. Online buyurtma va tezkor pickup xizmati.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
