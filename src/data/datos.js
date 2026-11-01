export const queHacemos = [
  { icono: "⛺", titulo: "Campamentos", texto: "Pernoctadas y salidas al aire libre para vivir la naturaleza." },
  { icono: "🤝", titulo: "Servicio", texto: "Aprendemos ayudando a nuestra comunidad." },
  { icono: "🧭", titulo: "Habilidades", texto: "Orientación, nudos, primeros auxilios y mucho más." },
  { icono: "⭐", titulo: "Liderazgo", texto: "Cada joven crece asumiendo responsabilidades." },
];

export const patrullas = [
  { nombre: "Águilas", colores: ["#1b5e20", "#111111"] },
  { nombre: "Lobos", colores: ["#facc15", "#111111"] },
  { nombre: "Panteras", colores: ["#facc15"] },
  { nombre: "Rinocerontes", colores: ["#14213d", "#f97316"] },
];

export const actividades = [
  { titulo: "Visita al cementerio", fecha: "Fecha por confirmar", lugar: "Por confirmar", formulario: "" },
  { titulo: "Pernocta en Lunahuaná", fecha: "Fecha por confirmar", lugar: "Lunahuaná", formulario: "" },
];

export const tramites = [
  { icono: "📝", titulo: "Inscripción a la tropa", texto: "Para jóvenes de 11 a 14 años que quieran unirse.", enlace: "" },
  { icono: "🩺", titulo: "Actualizar ficha médica", texto: "Los apoderados deben mantenerla al día.", enlace: "" },
];

export const documentos = [
  { titulo: "Reglamento de la tropa", descripcion: "Normas y organización.", archivo: "/biblioteca/reglamento-tropa.pdf" },
  { titulo: "Guía para padres de familia", descripcion: "Todo lo que necesitas saber.", archivo: "/biblioteca/guia-padres.pdf" },
];

export function fondoPatrulla(colores) {
  if (colores.length === 1) return colores[0];
  return `linear-gradient(135deg, ${colores[0]} 50%, ${colores[1]} 50%)`;
}