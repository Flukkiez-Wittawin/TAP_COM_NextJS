import NavGundamAuction from "@/app/components/navbar/navbar";
import BannerLanding from "@/app/components/BannerLanding/Page";
import ReviewsSection from "@/app/components/ReviewSection/Page";

import { Kanit } from "next/font/google";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-kanit",
});

export default function Home() {
  return (
    <main className={kanit.className}>
      <NavGundamAuction></NavGundamAuction>
      <BannerLanding></BannerLanding>
      <ReviewsSection></ReviewsSection>
    </main>
  );
}
