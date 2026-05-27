export type ClaimType = "linea" | "bingo";
export type ClaimStatus = "pending" | "approved" | "rejected";

export type Claim = {
  id: string;
  playerId: string;
  nickname: string;
  fichaId: string;
  fichaTitle: string;
  type: ClaimType;
  markedCells: number[];
  winningCells: number[]; // for linea: the 3 cells; for bingo: all 9
  conversation: string;
  claimedAt: number;
  status: ClaimStatus;
  validatedAt?: number;
  judgeNote?: string;
};

export type PlayerState = {
  id: string;
  nickname: string;
  fichaId: string;
  fichaTitle: string;
  markedCells: number[];
  feedback: string;
  joinedAt: number;
  lastUpdatedAt: number;
};

export type GameStatus = "playing" | "ended";

export type GameState = {
  status: GameStatus;
  endedAt?: number;
};

export type SlotState = {
  lineasTaken: number; // pending + approved
  lineasApproved: number;
  bingoTaken: boolean; // any pending or approved
  bingoApproved: boolean;
  gameStatus: GameStatus;
};

export type PlayerScore = {
  player: PlayerState;
  cellPoints: number;
  lineaPoints: number;
  bingoPoints: number;
  feedbackPoints: number;
  feedbackWords: number;
  total: number;
  hasLineaApproved: boolean;
  hasBingoApproved: boolean;
};
