import { redirect } from "next/navigation";
import { getAllPlayers } from "@/lib/kv";
import { AdminView } from "./AdminView";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ key?: string }>;
};

export default async function AdminPage({ searchParams }: Props) {
  const { key } = await searchParams;
  const expected = process.env.ADMIN_KEY;
  if (expected && key !== expected) {
    redirect("/");
  }
  const players = await getAllPlayers();
  players.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
  return <AdminView players={players} />;
}
