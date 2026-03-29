// src/app/(landing)/layout.tsx
// Minimal layout for the public landing page — no sidebar, no auth guard

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online X Auction",
  description:
    "Providing Auction Online",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}