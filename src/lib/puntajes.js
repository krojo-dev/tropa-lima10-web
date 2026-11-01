export const categorias = [
  "Juegos",
  "Espíritu scout",
  "Equipo Siempre Listos",
  "Presentación",
  "Puntualidad",
];

export async function obtenerFilas() {
  try {
    const respuesta = await fetch(process.env.APPS_SCRIPT_URL, {
      next: { revalidate: 15 },
    });
    const datos = await respuesta.json();
    return datos.filas ?? [];
  } catch (error) {
    console.error("No se pudieron leer los puntajes", error);
    return [];
  }
}

export function slug(nombre) {
  return nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function inicioSemana(fecha) {
  const d = new Date(fecha + "T00:00:00Z");
  const dia = d.getUTCDay();
  const diferencia = dia === 0 ? -6 : 1 - dia;
  d.setUTCDate(d.getUTCDate() + diferencia);
  return d.toISOString().slice(0, 10);
}

export function calcularRanking(filas, nombresPatrullas) {
  const totales = {};
  nombresPatrullas.forEach((nombre) => {
    totales[nombre] = 0;
  });
  filas.forEach((f) => {
    if (f.patrulla in totales) totales[f.patrulla] += f.puntos;
  });
  return Object.entries(totales)
    .map(([patrulla, puntos]) => ({ patrulla, puntos }))
    .sort((a, b) => b.puntos - a.puntos);
}

export function ganadoresPorSemana(filas, nombresPatrullas) {
  const semanas = [...new Set(filas.map((f) => inicioSemana(f.fecha)))].sort().reverse();
  return semanas.map((semana) => {
    const ranking = calcularRanking(
      filas.filter((f) => inicioSemana(f.fecha) === semana),
      nombresPatrullas
    );
    return { semana, ganador: ranking[0] };
  });
}

export function etiquetaSemana(inicio) {
  const desde = new Date(inicio + "T00:00:00Z");
  const hasta = new Date(desde);
  hasta.setUTCDate(hasta.getUTCDate() + 6);
  const formato = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", timeZone: "UTC" });
  return `${formato.format(desde)} al ${formato.format(hasta)}`;
}

export function etiquetaMes(clave) {
  const d = new Date(clave + "-01T00:00:00Z");
  return new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

export function puntosPorCategoria(filas, patrulla) {
  const resultado = {};
  categorias.forEach((c) => {
    resultado[c] = 0;
  });
  filas.forEach((f) => {
    if (f.patrulla === patrulla && f.categoria in resultado) {
      resultado[f.categoria] += f.puntos;
    }
  });
  return resultado;
}

export function posicion(ranking, patrulla) {
  return ranking.findIndex((r) => r.patrulla === patrulla) + 1;
}

export function puntosDe(ranking, patrulla) {
  return ranking.find((r) => r.patrulla === patrulla)?.puntos ?? 0;
}

export function evolucionSemanal(filas, patrulla, nombresPatrullas, cantidad = 8) {
  const semanas = [...new Set(filas.map((f) => inicioSemana(f.fecha)))].sort().slice(-cantidad);
  return semanas.map((semana) => {
    const delaSemana = filas.filter((f) => inicioSemana(f.fecha) === semana);
    const ranking = calcularRanking(delaSemana, nombresPatrullas);
    return {
      semana,
      puntos: puntosDe(ranking, patrulla),
      gano: ranking[0]?.patrulla === patrulla && ranking[0].puntos > 0,
    };
  });
}