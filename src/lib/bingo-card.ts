export type BingoCellType = "good" | "bad";

export type BingoCell = {
  id: number;
  text: string;
  type: BingoCellType;
};

// 6 buenos comportamientos (filas 1 y 2) + 3 malos (fila 3).
export const BINGO_CELLS: BingoCell[] = [
  { id: 0, type: "good", text: "Te pidió contexto específico antes de responder (tu municipio, rol, etapa)" },
  { id: 1, type: "good", text: "Te citó un caso concreto de una ciudad de la Red (con nombre, no genérico)" },
  { id: 2, type: "good", text: "Te nombró el Programa Ciudades Circulares de RIL como acompañamiento" },
  { id: 3, type: "good", text: "Te ofreció un recurso interno de RIL (template, manual, plantilla con nombre)" },
  { id: 4, type: "good", text: "Te trató como funcionario/a municipal en ejercicio" },
  { id: 5, type: "good", text: "Reconoció algo que NO sabe o NO tiene cargado, en vez de inventar" },
  { id: 6, type: "bad", text: "Te armó un documento, informe o template sin que se lo pidieras" },
  { id: 7, type: "bad", text: "Te dio una respuesta general que podría servir para cualquier municipio" },
  { id: 8, type: "bad", text: "Te respondió pero no te ofreció ayuda concreta para avanzar" },
];

export const TOTAL_CELLS = BINGO_CELLS.length;

const WINNING_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function getWinningLine(marked: number[]): number[] | null {
  const set = new Set(marked);
  for (const line of WINNING_LINES) {
    if (line.every((i) => set.has(i))) return line;
  }
  return null;
}

export function isFullCard(marked: number[]): boolean {
  if (marked.length < TOTAL_CELLS) return false;
  const set = new Set(marked);
  return BINGO_CELLS.every((c) => set.has(c.id));
}
