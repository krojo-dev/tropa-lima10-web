"use server";

import { revalidatePath } from "next/cache";
import { auth, esDirigente } from "@/auth";
import { patrullas } from "@/data/datos";
import { categorias } from "@/lib/puntajes";
import { agregarRegistro, listarRegistros, eliminarLote, reemplazarLote } from "@/lib/hoja";

function limpiarTexto(texto) {
  return String(texto ?? "").trim().replace(/^[=+\-@]+/, "").slice(0, 80);
}

async function dirigenteActual() {
  const sesion = await auth();
  const correo = sesion?.user?.email;
  return correo && esDirigente(correo) ? correo : null;
}

function fechaValida(fecha) {
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha ?? "");
}

function loteValido(lote) {
  return /^L-[0-9a-f]{8}$/.test(lote ?? "");
}

function validarRegistro({ fecha, categoria, detalle, tipo, puntos }) {
  if (!fechaValida(fecha)) return { error: "La fecha no es válida." };
  if (!categorias.includes(categoria)) return { error: "Elige una categoría." };

  const texto = limpiarTexto(detalle);
  const resta = tipo === "restar";
  if (resta && !texto) return { error: "Para restar puntos escribe una observación." };
  if (categoria === "Juegos" && !texto) return { error: "Escribe el nombre del juego." };

  const valores = [];
  for (const p of patrullas) {
    const crudo = puntos?.[p.nombre];
    if (crudo === undefined || crudo === null || String(crudo).trim() === "") continue;
    const numero = Number(crudo);
    if (!Number.isFinite(numero) || Math.abs(numero) > 1000) {
      return { error: `El puntaje de ${p.nombre} no es válido.` };
    }
    valores.push({
      patrulla: p.nombre,
      puntos: resta ? -Math.abs(numero) : Math.abs(numero),
    });
  }
  if (valores.length === 0) return { error: "Ingresa el puntaje de al menos una patrulla." };

  return { fecha, categoria, detalle: texto, valores };
}

export async function registrarPuntajes(datos) {
  const correo = await dirigenteActual();
  if (!correo) return { ok: false, error: "No tienes permiso para guardar puntajes." };

  const registro = validarRegistro(datos);
  if (registro.error) return { ok: false, error: registro.error };

  try {
    await agregarRegistro({ ...registro, correo });
  } catch (error) {
    console.error("Error al guardar en la hoja", error);
    return { ok: false, error: "No se pudo guardar. Intenta de nuevo." };
  }

  revalidatePath("/puntajes");
  return { ok: true, total: registro.valores.length };
}

export async function listarRegistrosDelDia(fecha) {
  const correo = await dirigenteActual();
  if (!correo) return { ok: false, error: "No tienes permiso." };
  if (!fechaValida(fecha)) return { ok: false, error: "La fecha no es válida." };

  try {
    const registros = await listarRegistros(fecha);
    return { ok: true, registros };
  } catch (error) {
    console.error("Error al leer la hoja", error);
    return { ok: false, error: "No se pudo cargar el historial." };
  }
}

export async function actualizarRegistro({ lote, ...datos }) {
  const correo = await dirigenteActual();
  if (!correo) return { ok: false, error: "No tienes permiso para editar." };
  if (!loteValido(lote)) return { ok: false, error: "Registro inválido." };

  const registro = validarRegistro(datos);
  if (registro.error) return { ok: false, error: registro.error };

  try {
    const existe = await reemplazarLote({ lote, ...registro, correo });
    if (!existe) return { ok: false, error: "Ese registro ya no existe." };
  } catch (error) {
    console.error("Error al editar en la hoja", error);
    return { ok: false, error: "No se pudo editar. Intenta de nuevo." };
  }

  revalidatePath("/puntajes");
  return { ok: true };
}

export async function eliminarRegistro(lote) {
  const correo = await dirigenteActual();
  if (!correo) return { ok: false, error: "No tienes permiso para eliminar." };
  if (!loteValido(lote)) return { ok: false, error: "Registro inválido." };

  try {
    const existia = await eliminarLote(lote);
    if (!existia) return { ok: false, error: "Ese registro ya no existe." };
  } catch (error) {
    console.error("Error al eliminar en la hoja", error);
    return { ok: false, error: "No se pudo eliminar. Intenta de nuevo." };
  }

  revalidatePath("/puntajes");
  return { ok: true };
}