"use server";

import { revalidatePath } from "next/cache";
import { auth, esDirigente } from "@/auth";
import { patrullas } from "@/data/datos";
import { categorias } from "@/lib/puntajes";
import { guardarEnHoja } from "@/lib/hoja";

function limpiarTexto(texto) {
  return String(texto ?? "").trim().replace(/^[=+\-@]+/, "").slice(0, 60);
}

export async function guardarPuntajes({ fecha, lineas, reemplazar }) {
  const sesion = await auth();
  if (!sesion || !esDirigente(sesion.user?.email)) {
    return { ok: false, error: "No tienes permiso para guardar puntajes." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha ?? "")) {
    return { ok: false, error: "La fecha no es válida." };
  }
  if (!Array.isArray(lineas) || lineas.length === 0 || lineas.length > 200) {
    return { ok: false, error: "Ingresa al menos un puntaje." };
  }

  const nombres = patrullas.map((p) => p.nombre);
  const filas = [];

  for (const l of lineas) {
    const puntos = Number(l.puntos);
    const valido =
      nombres.includes(l.patrulla) &&
      categorias.includes(l.categoria) &&
      Number.isFinite(puntos) &&
      puntos >= -100 &&
      puntos <= 1000;

    if (!valido) {
      return { ok: false, error: "Hay un dato inválido en el formulario." };
    }
    filas.push([fecha, l.patrulla, l.categoria, limpiarTexto(l.detalle), puntos]);
  }

  try {
    const resultado = await guardarEnHoja(fecha, filas, Boolean(reemplazar));
    if (resultado.duplicada) return { ok: false, duplicada: true };
  } catch (error) {
    console.error("Error al guardar en la hoja", error);
    return { ok: false, error: "No se pudo guardar. Intenta de nuevo." };
  }

  revalidatePath("/puntajes");
  return { ok: true, total: filas.length };
}