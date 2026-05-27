import { getAllClaims, kvAvailable } from "@/lib/kv";
import PantallaLive from "./PantallaLive";

export default async function PantallaPage() {
  const initial = kvAvailable() ? await getAllClaims() : [];
  return <PantallaLive initialClaims={initial} />;
}
