import { getAllPlayers, getAllClaims, getGame } from "@/lib/kv";
import { rankPlayers } from "@/lib/scoring";
import RankingView from "./RankingView";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const [players, claims, game] = await Promise.all([
    getAllPlayers(),
    getAllClaims(),
    getGame(),
  ]);
  const ranking = rankPlayers(players, claims);
  return <RankingView initialRanking={ranking} initialGame={game} />;
}
