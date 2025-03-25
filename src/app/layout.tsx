import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MonoHabit | Transformez votre vie, une habitude à la fois",
  description:
    "MonoHabit vous aide à développer une seule habitude à la fois pour transformer votre vie, inspiré par les principes d'Atomic Habits de James Clear.",
  keywords: [
    "habitudes",
    "développement personnel",
    "atomic habits",
    "productivité",
    "bien-être",
    "james clear",
    "habitude unique",
    "transformation",
  ],
  openGraph: {
    title: "MonoHabit | Transformez votre vie, une habitude à la fois",
    description:
      "Concentrez-vous sur une seule habitude à la fois et transformez votre vie avec MonoHabit.",
    images: [
      {
        url: "/images/monohabit-og.png",
        width: 1200,
        height: 630,
        alt: "MonoHabit",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MonoHabit | Une habitude à la fois",
    description:
      "Concentrez-vous sur une seule habitude à la fois et transformez votre vie.",
    images: ["/images/monohabit-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
