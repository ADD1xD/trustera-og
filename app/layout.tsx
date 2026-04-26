import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { BrutalNotificationProvider } from "@/components/ui/BrutalNotification";

// Force dynamic rendering for all pages (wallet SDK needs client-side state)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TRUSTERA | ONCHAIN BOUNTIES",
  description: "Post bounties. Hunt rewards. Get paid onchain.",
  keywords: ["bounty", "web3", "worldchain", "crypto", "onchain", "trustera"],
  other: {
    "base:app_id": "69422f91d19763ca26ddc37d",
  },
  icons: {
    icon: "/basepad-icon-32.png",
    shortcut: "/basepad-icon-64.png",
    apple: "/basepad-icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f0f6ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className="bg-[#f0f6ff]">
      <body className="min-h-screen antialiased font-sans pb-24">
        <Providers>
            <BrutalNotificationProvider>
                {children}
            </BrutalNotificationProvider>
        </Providers>
      </body>
    </html>
  );
}
