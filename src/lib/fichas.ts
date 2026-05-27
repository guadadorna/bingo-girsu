export type Ficha = {
  id: string;
  title: string;
  description: string;
};

// Placeholder de situaciones para que las personas prueben el agente.
// Editar libremente antes del workshop.
export const FICHAS: Ficha[] = [
  {
    id: "ficha-1",
    title: "Municipio chico arrancando",
    description:
      "Sos funcionario/a de un municipio de 15.000 habitantes que recién empieza a pensar la gestión de residuos. No tenés ordenanza, ni separación, ni planta. Querés saber por dónde empezar.",
  },
  {
    id: "ficha-2",
    title: "Recuperadores informales",
    description:
      "En tu ciudad hay un grupo de recuperadores informales trabajando en el basural a cielo abierto. Querés formalizar su tarea pero no sabés cómo articular sin generar conflicto.",
  },
  {
    id: "ficha-3",
    title: "Ordenanza trabada",
    description:
      "Tu intendente quiere sacar una ordenanza de separación en origen pero el HCD la trabó. Necesitás argumentos y ejemplos de otros municipios que lo hayan logrado.",
  },
  {
    id: "ficha-4",
    title: "Planta de tratamiento parada",
    description:
      "Tu municipio tiene una planta de tratamiento que está funcionando al 30% de capacidad. Querés entender qué pasos seguir para optimizarla.",
  },
  {
    id: "ficha-5",
    title: "Campaña de concientización",
    description:
      "Te pidieron armar una campaña de concientización ciudadana sobre separación de residuos. Tenés presupuesto limitado y dos meses.",
  },
  {
    id: "ficha-6",
    title: "Financiamiento para infraestructura",
    description:
      "Buscás financiamiento para construir una planta de transferencia. No sabés a qué programa nacional o provincial aplicar.",
  },
  {
    id: "ficha-7",
    title: "Articulación regional",
    description:
      "Tres municipios vecinos quieren coordinar la gestión de residuos pero no se ponen de acuerdo en cómo dividir costos y responsabilidades.",
  },
  {
    id: "ficha-8",
    title: "Comunicación con vecinos",
    description:
      "Los vecinos del barrio donde está el predio de disposición final están protestando. Necesitás abrir un canal de diálogo.",
  },
];

export function findFicha(id: string): Ficha | undefined {
  return FICHAS.find((f) => f.id === id);
}
