import type { Metadata } from "next";
import "./globals.css";
import { PortfolioProvider } from "@/context/PortfolioContext";

export const metadata: Metadata = {
  title: "Kazi Hamidur Rahman | Technical Lead – Software Quality Assurance",
  description: "Professional portfolio of Kazi Hamidur Rahman, Technical Lead – Software Quality Assurance.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><PortfolioProvider>{children}</PortfolioProvider></body></html>;
}
