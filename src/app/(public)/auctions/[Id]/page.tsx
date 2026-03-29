import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import { AuctionDetailClient } from "@/components/auction-detail-client";

export const dynamic = "force-dynamic";


export default async function AuctionDetailPage({ params }: { params: Promise<{ Id: string }> }) {
  const { Id: id } = await params;  // destructure Id, alias it as id
  const auction = await api.auction.byId({ id }).catch(() => null);
  if (!auction) notFound();
  return <AuctionDetailClient auction={auction as any} />;
}