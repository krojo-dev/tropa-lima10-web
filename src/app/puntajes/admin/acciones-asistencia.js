"use server";

import { revalidatePath, updateTag } from "next/cache";
import { correoDirigente } from "@/auth";
import { estadosAsistencia } from "@/data/datos";
import {
  leerAsistenciaDelDia,
  guardarMarcas,
  resumenDirigentesCacheado,
} from "@/lib/asistencia";

function fechaValida(fecha) {
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha ?? "");
}

export async function obtenerAsistenciaDelDia(fecha) {
  if (!(await correoDirigente())) return { ok: false, error: "No tienes permiso." };
  if (!fechaValida(fecha)) return { ok: false, error: "La fecha no es válida." };
  try {
    return { ok: true, marcas: await leerAsistenciaDelDia(fecha) };
  } catch (error) {
    console.error("Error al leer asistencia", error);
    return { ok: false, error: "No se pudo cargar la asistencia." };
  }
}

export async function guardarAsistencia({ fecha, marcas }) {
  const correo = await correoDirigente();
  if (!correo) return { ok: false, error: "No tienes permiso." };
  if (!fechaValida(fecha)) return { ok: false, error: "La fecha no es válida." };
  if (!Array.isArray(marcas) || marcas.length === 0 || marcas.length > 100) {
    return { ok: false, error: "No hay marcas para guardar." };
  }

  const limpias = [];
  for (const m of marcas) {
    const codigo = String(m?.codigo ?? "").trim();
    if (!/^[A-Za-z0-9\-_.]{2,20}$/.test(codigo) || !estadosAsistencia.includes(m?.estado)) {
      return { ok: false, error: "Hay una marca inválida." };
    }
    limpias.push({ codigo, estado: m.estado });
  }

  try {
    const resultado = await guardarMarcas({ fecha, marcas: limpias, correo });
    updateTag("asistencia");
    revalidatePath("/puntajes", "layout");
    return { ok: true, ...resultado };
  } catch (error) {
    console.error("Error al guardar asistencia", error);
    return { ok: false, error: "No se pudo guardar. Intenta de nuevo." };
  }
}

export async function obtenerResumenDirigentes() {
  if (!(await correoDirigente())) return { ok: false, error: "No tienes permiso." };
  try {
    const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });
    return { ok: true, resumen: await resumenDirigentesCacheado(hoy) };
  } catch (error) {
    console.error("Error al calcular el resumen", error);
    return { ok: false, error: "No se pudo cargar el resumen." };
  }
}

export async function refrescarDatos() {
  if (!(await correoDirigente())) return { ok: false, error: "No tienes permiso." };
  updateTag("asistencia");
  updateTag("puntajes");
  revalidatePath("/puntajes", "layout");
  return { ok: true };
}