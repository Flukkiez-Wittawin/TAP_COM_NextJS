import Providers from "@/app/components/Providers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Kanit } from "next/font/google";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-kanit",
});

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "TAP.COM - Live Gundam Auctions",
  description: "@TAPCOM - Live Gundam Auctions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={kanit.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
