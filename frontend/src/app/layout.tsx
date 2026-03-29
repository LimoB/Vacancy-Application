import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/src/app/globals.css"; // Fixed: Absolute path to avoid Module Not Found
import { Providers } from "./Providers"; // Import the wrapper we just made

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VacanC | Job Portal",
  description: "Find your next career opportunity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Fix: Wrap the children in the Providers component */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}