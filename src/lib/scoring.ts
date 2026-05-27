import type { Claim, PlayerScore, PlayerState } from "./types";

// Configurable scoring weights. Editar antes del evento si querés.
export const SCORING = {
  // Cada casilla marcada
  pointsPerCell: 2,
  // Bonus si la linea fue aprobada por el juez
  pointsPerLineaApproved: 25,
  // Bonus si el bingo fue aprobado por el juez
  pointsPerBingoApproved: 80,
  // Cada palabra del feedback final
  pointsPerFeedbackWord: 3,
  // Tope de palabras puntuadas (despues no suma mas)
  maxFeedbackWords: 200,
  // Limites globales del juego
  maxLineasGlobal: 3,
  maxBingoGlobal: 1,
} as const;

export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function scorePlayer(
  player: PlayerState,
  claims: Claim[]
): PlayerScore {
  const myClaims = claims.filter((c) => c.playerId === player.id);
  const hasLineaApproved = myClaims.some(
    (c) => c.type === "linea" && c.status === "approved"
  );
  const hasBingoApproved = myClaims.some(
    (c) => c.type === "bingo" && c.status === "approved"
  );

  const cellPoints = player.markedCells.length * SCORING.pointsPerCell;
  const lineaPoints = hasLineaApproved ? SCORING.pointsPerLineaApproved : 0;
  const bingoPoints = hasBingoApproved ? SCORING.pointsPerBingoApproved : 0;

  const feedbackWords = countWords(player.feedback);
  const countedWords = Math.min(feedbackWords, SCORING.maxFeedbackWords);
  const feedbackPoints = countedWords * SCORING.pointsPerFeedbackWord;

  return {
    player,
    cellPoints,
    lineaPoints,
    bingoPoints,
    feedbackPoints,
    feedbackWords,
    total: cellPoints + lineaPoints + bingoPoints + feedbackPoints,
    hasLineaApproved,
    hasBingoApproved,
  };
}

export function rankPlayers(
  players: PlayerState[],
  claims: Claim[]
): PlayerScore[] {
  return players
    .map((p) => scorePlayer(p, claims))
    .sort((a, b) => b.total - a.total);
}

export function maxPossibleScore(): number {
  return (
    9 * SCORING.pointsPerCell +
    SCORING.pointsPerLineaApproved +
    SCORING.pointsPerBingoApproved +
    SCORING.maxFeedbackWords * SCORING.pointsPerFeedbackWord
  );
}
