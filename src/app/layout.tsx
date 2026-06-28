import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ClientBody from "@/components/ClientBody";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jaygurav.com"),
  title: "Jay Gurav | Cinematic Photography",
  description: "Premium photography portfolio featuring stories through a cinematic lens.",
  openGraph: {
    title: "Jay Gurav | Cinematic Photography",
    description: "Premium photography portfolio featuring stories through a cinematic lens.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jay Gurav | Cinematic Photography",
    images: ["/og-image.jpg"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <ClientBody className={`${inter.variable} ${playfair.variable} antialiased bg-background text-foreground`}>
        {children}
      </ClientBody>
    </html>
  );
}
