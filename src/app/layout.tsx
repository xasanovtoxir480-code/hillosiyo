import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PickUp Market — Toshkent",
  description: "Bozor narxidan arzon, navbat yo'q, toza va saralangan mahsulotlar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
