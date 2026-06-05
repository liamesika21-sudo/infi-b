import type { Metadata } from "next";
import { Geist, Geist_Mono, Heebo } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://infi.mentora-edu.com"),
  title: "Mentora | אינפי ב׳",
  description: "Mentora — מערכת הכנה ייעודית לאינפי ב׳ למועד א׳ וליעד 90+.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/brand/mentora-icon-64.png", type: "image/png", sizes: "64x64" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Mentora | אינפי ב׳",
    description: "מערכת הכנה ייעודית לאינפי ב׳ למועד א׳ וליעד 90+.",
    images: [{ url: "/brand/mentora-social-preview.png", width: 1228, height: 570, alt: "Mentora" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${geistSans.variable} ${geistMono.variable} ${heebo.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
