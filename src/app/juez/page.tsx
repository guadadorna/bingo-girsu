import { redirect } from "next/navigation";
import { getAllClaims, kvAvailable } from "@/lib/kv";
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

  const initialClaims = kvAvailable() ? await getAllClaims() : [];

  return <JuezDashboard initialClaims={initialClaims} />;
}
