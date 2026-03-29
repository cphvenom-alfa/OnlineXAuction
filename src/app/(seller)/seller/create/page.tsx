import { CreateAuctionForm } from "@/components/create-auction-form";
export default function CreateAuctionPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Create New Auction</h1>
      <CreateAuctionForm />
    </div>
  );
}
