export type ClaimStatus = "pending" | "approved" | "rejected";

export type Claim = {
  id: string;
  nickname: string;
  fichaId: string;
  fichaTitle: string;
  markedCells: number[];
  winningLine: number[];
  conversation: string;
  claimedAt: number;
  status: ClaimStatus;
  validatedAt?: number;
  judgeNote?: string;
};

export type ClaimSummary = Pick<
  Claim,
  "id" | "nickname" | "fichaTitle" | "claimedAt" | "status"
>;
