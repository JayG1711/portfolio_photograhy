import { Metadata } from "next";
import TipsClient from "@/components/TipsClient";

export const metadata: Metadata = {
  title: "Photography Tips | Jay Gurav",
  description: "Explore photography rules, day-to-day practices, and mobile photography secrets.",
};

export default function Tips() {
  return <TipsClient />;
}
