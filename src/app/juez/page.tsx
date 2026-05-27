import { redirect } from "next/navigation";
import { getAllClaims, getSlotState } from "@/lib/kv";
import JuezDashboard from "./JuezDashboard";

type SearchParams = Promise<{ key?: string }>;

export default async function JuezPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { key } = await searchParams;
  const expected = process.env.JUEZ_KEY;

  if (expected && key !== expected) {
    redirect("/");
  }

  const [initialClaims, initialSlots] = await Promise.all([
    getAllClaims(),
    getSlotState(),
  ]);

  return (
    <JuezDashboard
      initialClaims={initialClaims}
      initialSlots={initialSlots}
    />
  );
}
