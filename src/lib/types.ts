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
