export type Ficha = {
  id: string;
  letras: string;
  category: string;
  title: string;
  situation: string;
  question: string;
  followUps: string[];
};

// 14 fichas del PDF "Fichas para la dinámica de testeo — Participantes"
// (Agente GIRSU · Ciudades Circulares · 2026), asignadas por rango de apellido.
// Rebalancear si la lista real de inscriptos lo pide.
export const FICHAS: Ficha[] = [
  {
    id: "ficha-01",
    letras: "A",
    category: "Gobernanza y liderazgo · Plan GIRSU",
    title: "Plan GIRSU",
    situation:
      "Sos Director de Ambiente de Santa Rosa (Mendoza, 15.000 hab.), ciudad cabecera del departamento homónimo, zona rural y vitivinícola. Hay un plan de gestión de residuos de 2019 que nadie usa: no tiene metas numéricas, nunca se publicó y quedó desactualizado. El Intendente te pidió que lo rehagas antes de fin de año para presentarlo al gobierno provincial de Mendoza, que exige tener un plan vigente.",
    question:
      "Tengo un plan GIRSU viejo que no sirve y me pidieron rehacerlo. ¿Por dónde arranco y qué debe tener el nuevo plan para que sea válido y útil?",
    followUps: [
      "¿Qué datos necesito tener antes de empezar a escribir el plan?",
      "¿Hay un template o ejemplo de plan que pueda usar como base?",
      "¿Es obligatorio presentarlo a la provincia? ¿Con qué formato?",
      "¿Cuánto tiempo razonable lleva armarlo bien?",
    ],
  },
  {
    id: "ficha-02",
    letras: "B",
    category: "Construcción de la información · Indicadores de gestión",
    title: "Indicadores de gestión",
    situation:
      "Sos Coordinadora GIRSU de Oberá (Misiones, 65.000 hab.). Tenés una planta de tratamiento que funciona y un relleno sanitario, pero nunca definiste indicadores formales. Cuando el gobierno provincial te pregunta cuántas toneladas reciclaste este año, no podés responder con certeza. Hay datos sueltos en planillas de distintas áreas, pero sin sistema.",
    question:
      "Necesito armar un sistema de indicadores de gestión para saber qué está pasando realmente con los residuos en mi municipio. ¿Cómo lo hago?",
    followUps: [
      "¿Cuáles son los 3 indicadores más importantes para empezar?",
      "¿Cómo obtengo el dato de toneladas si no tengo báscula propia?",
      "¿Con qué herramienta digital te parece más fácil arrancar?",
      "¿Cada cuánto tiempo tengo que actualizar los datos para que sean útiles?",
    ],
  },
  {
    id: "ficha-03",
    letras: "Ca-Cl",
    category: "Construcción de la información · Registro de microbasurales",
    title: "Microbasurales",
    situation:
      "Sos Secretaria de Ambiente de Posadas (Misiones, 320.000 hab.). En los últimos meses proliferaron microbasurales en barrios periféricos y zonas de bañados. El equipo de campo los conoce de manera informal, pero no hay un registro sistematizado: no sabés cuántos son, dónde están exactamente ni de qué tamaño. Te piden un plan de intervención y no podés armarlo sin datos.",
    question:
      "Se nos llenó la ciudad de microbasurales y no tenemos registrado ninguno de forma oficial. Necesito armar un registro desde cero para poder actuar.",
    followUps: [
      "¿Qué aplicación concreta me recomendás para el relevamiento en campo?",
      "¿Cómo involucrar a los vecinos en el mapeo sin que se convierta en un problema político?",
      "¿Hay un protocolo para clasificar microbasurales por nivel de riesgo?",
      "¿Podés mostrarme un ejemplo concreto de cómo se ve un registro de microbasurales? ¿Hay algún mapa o planilla de otra ciudad que pueda usar de referencia?",
    ],
  },
  {
    id: "ficha-04",
    letras: "Cm-Cz",
    category: "Generación y separación en origen · Plan de separación ciudadana",
    title: "Separación en origen",
    situation:
      "Sos Coordinadora GIRSU de Sunchales (Santa Fe, 25.000 hab.). La ciudad tiene recolección diferenciada en algunas zonas, pero la separación en origen de la ciudadanía es muy baja: la mayoría saca todo junto. No hay un plan formal de separación: hubo campañas sueltas en redes, pero sin continuidad ni seguimiento. La planta de recuperación recibe mucho rechazo por la falta de separación previa.",
    question:
      "Tenemos recolección diferenciada pero la gente no separa. ¿Cómo arrancar un plan real de separación en origen que funcione y no quede solo en campaña de redes?",
    followUps: [
      "¿Cómo elijo el barrio piloto ideal para empezar?",
      "¿Qué mensajes funcionan mejor para que la gente separe? ¿Hay ejemplos concretos?",
      "¿Cómo mido si el plan está funcionando o no?",
      "¿Con qué frecuencia debería hacer esta recolección?",
    ],
  },
  {
    id: "ficha-05",
    letras: "D-E",
    category: "Recolección y tratamiento · Recolección diferenciada ciudadana",
    title: "Recolección diferenciada",
    situation:
      "Sos Director de Servicios Públicos de Curuzú Cuatiá (Corrientes, 40.000 hab.). El plan GIRSU recién aprobado fija como meta implementar recolección diferenciada este año. Hoy todos los residuos salen en el mismo camión. Tenés 4 camiones de recolección, presupuesto limitado y querés hacer algo concreto antes de fin de año.",
    question:
      "Tengo que implementar recolección diferenciada este año pero arrancamos de cero. ¿Cómo lo organizo con los recursos que tengo?",
    followUps: [
      "¿Cómo comunico a los vecinos los nuevos horarios y días de recolección?",
      "¿Qué pasa si separo los residuos pero no tengo planta de tratamiento cerca?",
      "¿Puedo usar los mismos camiones para la recolección diferenciada o necesito flota nueva?",
      "¿Cómo formalizo el acuerdo con acopiadores o cooperativas locales?",
    ],
  },
  {
    id: "ficha-06",
    letras: "F",
    category: "Recolección y tratamiento · Instalación de Recuperación de Materiales (IRM)",
    title: "Planta de reciclaje",
    situation:
      "Sos Intendente de Malabrigo (Santa Fe, 12.000 hab.). Tu municipio separa los residuos secos con una buena adopción ciudadana, pero termina todo en el relleno sanitario porque no tenés planta de recuperación propia ni acuerdo con nadie. Hay una cooperativa de recuperadores en la ciudad vecina de Reconquista y una planta privada a 60 km. Querés resolver el destino de los secos este año.",
    question:
      "Separamos los residuos secos pero igual van todos al relleno porque no tenemos adónde mandarlos. ¿Cómo resuelvo el destino de los secos?",
    followUps: [
      "¿Qué tipo de convenio tengo que firmar con una cooperativa para entregarle los materiales reciclables?",
      "¿Quién paga el flete, el municipio o la planta receptora?",
      "¿Cómo sé si los materiales que mando tienen suficiente calidad para ser aceptados?",
      "¿Qué necesitaría para arrancar el proceso de armado de una planta municipal en mi ciudad?",
    ],
  },
  {
    id: "ficha-07",
    letras: "G",
    category: "Recolección y tratamiento · Tratamiento de residuos orgánicos",
    title: "Compostaje",
    situation:
      "Sos Coordinadora GIRSU de Villaguay (Entre Ríos, 35.000 hab.). El 55% de los residuos que van al relleno son orgánicos. El plan GIRSU fijó como meta tratar los orgánicos, pero no tenés planta de compostaje. Hay un predio municipal disponible de 1 hectárea y algo de presupuesto. Querés arrancar este año.",
    question:
      "Más de la mitad de lo que mandamos al relleno es orgánico. Tenemos un predio disponible y queremos armar una planta de compostaje. ¿Cómo lo hacemos?",
    followUps: [
      "¿Con cuántas toneladas diarias de orgánicos es viable una planta de compostaje?",
      "¿Qué diferencia hay entre compostaje en filas y vermicompost? ¿Cuál me conviene?",
      "¿Cómo consigo que los grandes generadores (restaurantes, verdulerías) me entreguen los orgánicos?",
      "¿Qué certificación necesita el compost para poder venderlo o donarlo?",
    ],
  },
  {
    id: "ficha-08",
    letras: "H-J",
    category: "Concientización · Campañas de educación ambiental",
    title: "Educación ambiental y comunicación",
    situation:
      "Sos Directora de Ambiente de Junín (Buenos Aires, 100.000 hab.). En los últimos dos años hicieron campañas de separación en origen: posteos en redes, algunos folletos y un evento en la plaza. La participación ciudadana no mejoró y el % de rechazo en la planta sigue alto. Tenés que armar la estrategia de comunicación para el próximo año con presupuesto limitado.",
    question:
      "Llevamos dos años haciendo campañas de separación y no cambia nada. El rechazo en la planta sigue igual. ¿Qué estamos haciendo mal y cómo lo mejoramos?",
    followUps: [
      "¿Cómo evalúo si una campaña de separación funcionó o no?",
      "¿Qué mensajes concretos generan más cambio de comportamiento en separación?",
      "¿Cuántos promotores ambientales necesito para cubrir una ciudad de 100.000 hab.?",
      "¿Hay un plan de comunicación modelo que pueda adaptar?",
    ],
  },
  {
    id: "ficha-09",
    letras: "K-L",
    category: "Políticas y regulaciones · Ordenanza GIRSU",
    title: "Ordenanza de GIRSU",
    situation:
      "Sos Secretaria de Ambiente de Gualeguaychú (Entre Ríos, 85.000 hab.). El municipio tiene varias ordenanzas sueltas: una de recolección del 2010, una sobre plásticos de 2019, una de grandes generadores incompleta. Pero no hay una ordenanza integral de GIRSU. El Concejo Deliberante te pidió un proyecto que unifique todo. No sabés bien por dónde empezar ni qué tiene que incluir para que sea válida y aplicable.",
    question:
      "Me pidieron armar un proyecto de ordenanza integral de GIRSU para presentar al Concejo. Tenemos varias ordenanzas viejas y sueltas. ¿Qué tiene que incluir y cómo evito que quede desactualizada o inaplicable? Y sobre todo: ¿cómo me aseguro de que sea realista para el tamaño y las capacidades de mi ciudad, y no una ordenanza de otra ciudad que acá nunca se va a poder cumplir?",
    followUps: [
      "¿Qué dice la Ley Nacional 25.916 que no puedo ignorar en la ordenanza?",
      "¿Cómo defino los grandes generadores en el texto? ¿Qué umbral de volumen uso?",
      "¿Cómo hago para que la ordenanza no quede aprobada pero sin implementación?",
      "¿Hay modelos de ordenanza de otras ciudades argentinas que pueda usar como base?",
    ],
  },
  {
    id: "ficha-10",
    letras: "Ma-Mn",
    category: "Recolección y tratamiento · Saneamiento de basurales",
    title: "Saneamiento de basural",
    situation:
      "Sos Intendente de Villa Ángela (Chaco, 55.000 hab.). El basural a cielo abierto se cerró hace 3 años y empezaron a usar un relleno sanitario compartido con un municipio vecino. Pero el predio viejo sigue contaminando: hay lixiviados que llegan a una laguna cercana, los vecinos se quejan del olor y nadie hizo obras de saneamiento. El gobierno provincial te pidió un plan de obras.",
    question:
      "Cerramos el basural hace tres años pero sigue contaminando: hay lixiviados, olores y los vecinos reclaman. El gobierno provincial nos pide un plan de obras de saneamiento. ¿Qué tenemos que hacer?",
    followUps: [
      "¿Qué empresa o profesional tiene que hacer el estudio de impacto ambiental?",
      "¿Cuánto cuesta aproximadamente sanear un basural de ese tamaño?",
      "¿Hay líneas de financiamiento específicas para saneamiento de basurales en Argentina?",
      "¿Qué organismo provincial o nacional supervisa que el plan de obras cumpla los estándares?",
    ],
  },
  {
    id: "ficha-11",
    letras: "Mo-Mz",
    category: "Valorización y mercado de residuos · Formalización fiscal de ventas de reciclables",
    title: "Mercado de reciclables",
    situation:
      "Sos Coordinador de una planta de recuperación municipal de San Lorenzo (Santa Fe, 50.000 hab.). La planta vende cartón, PET y metales a acopiadores locales. Todo se hace en efectivo, sin factura y sin declarar. El nuevo Contador Municipal te dijo que eso es irregular y hay que formalizarlo. Pero no sabés cómo hacerlo sin que se complique la operatoria.",
    question:
      "Vendemos reciclables pero todo está en negro: efectivo, sin factura, sin declarar. El contador dice que hay que formalizarlo. ¿Cómo lo hacemos sin que la operatoria se complique?",
    followUps: [
      "¿En qué categoría del monotributo encaja una cooperativa de reciclado?",
      "¿Cómo convenzo a los acopiadores de que también a ellos les conviene formalizar?",
      "¿Qué régimen impositivo especial tienen las cooperativas?",
      "¿Hay algún beneficio fiscal para municipios que vendan materiales reciclables?",
    ],
  },
  {
    id: "ficha-12",
    letras: "N-O-P",
    category: "Presupuesto · Costos de tratamiento y valorización",
    title: "Costos de tratamiento",
    situation:
      "Sos Secretaria de Finanzas de Venado Tuerto (Santa Fe, 75.000 hab.). La ciudad tiene una planta de tratamiento de residuos secos que funciona hace 2 años. El intendente te preguntó si es rentable: cuánto cuesta operar la planta vs. cuánto ingresa por venta de materiales. Nunca se hizo ese análisis y no tenés los datos organizados.",
    question:
      "El intendente me preguntó si la planta de tratamiento es rentable. No tenemos el análisis hecho. ¿Cómo calculo si nos cuesta más operar la planta de lo que recuperamos por la venta de materiales?",
    followUps: [
      "¿Cuál es el precio de mercado actual del cartón, PET y vidrio en Argentina?",
      "¿Cuánto cuesta en promedio mandar una tonelada a un relleno sanitario?",
      "¿Hay alguna herramienta o planilla para hacer este análisis más fácil?",
      "¿Qué % de los costos de una planta suele cubrirse con la venta de materiales?",
    ],
  },
  {
    id: "ficha-13",
    letras: "Q-R",
    category: "Políticas y regulaciones · Plan de rehabilitación de predio de disposición final",
    title: "Plan de rehabilitación relleno sanitario",
    situation:
      "Sos Coordinadora GIRSU de Villa María (Córdoba, 90.000 hab.). El relleno sanitario compartido con municipios vecinos tiene vida útil estimada de 4 años más. No hay plan de rehabilitación del predio ni de qué hacer cuando cierre. El gobierno provincial te pidió presentar un plan de cierre y rehabilitación.",
    question:
      "El relleno sanitario cierra en 4 años y no tenemos ningún plan para cuando eso pase. El gobierno provincial nos pide un plan de rehabilitación del predio. ¿Qué tiene que incluir ese plan?",
    followUps: [
      "¿Cuánto tiempo dura el monitoreo post-cierre de un relleno sanitario?",
      "¿Qué organismo nacional o provincial puede financiar el plan de cierre?",
      "¿El biogás de un relleno de ese tamaño puede aprovecharse para generar energía?",
      "¿Cómo coordino el plan con los municipios vecinos que también usan el relleno?",
    ],
  },
  {
    id: "ficha-14",
    letras: "S-Z",
    category: "Vinculación · Articulación con empresas privadas para circularidad",
    title: "Articulación público privada",
    situation:
      "Sos Director de Ambiente de Rafaela (Santa Fe, 100.000 hab.). Una empresa alimenticia radicada en la ciudad ofrece donar 3 compactadoras y financiar una isla de reciclaje a cambio de que el municipio la mencione en las comunicaciones y le extienda algún tipo de reconocimiento oficial. No tenés claro si aceptar, cómo formalizarlo ni si hay algún riesgo político o legal.",
    question:
      "Una empresa grande nos ofrece donar equipamiento para reciclaje a cambio de visibilidad y un reconocimiento municipal. No sé si conviene aceptar, cómo formalizarlo y si hay algún riesgo.",
    followUps: [
      "¿Qué cláusulas mínimas debe tener un convenio de donación de equipamiento con una empresa?",
      "¿Qué pasa si la empresa después quiere condicionar decisiones del municipio?",
      "¿Hay marcos legales específicos para convenios público-privados en municipios argentinos?",
      "¿Cómo incluyo a la cooperativa de recuperadores en el esquema sin que la empresa se oponga?",
    ],
  },
];

export function findFicha(id: string): Ficha | undefined {
  return FICHAS.find((f) => f.id === id);
}
