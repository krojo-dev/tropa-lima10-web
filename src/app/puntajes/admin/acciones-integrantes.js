"use server";

import { correoDirigente } from "@/auth";
import { patrullas, roles } from "@/data/datos";
import { listarIntegrantes, crearIntegrante, actualizarIntegrante } from "@/lib/registro";
import { updateTag } from "next/cache";

function limpiar(valor, maximo = 60) {
  return String(valor ?? "").trim().replace(/^[=+\-@]+/, "").slice(0, maximo);
}

function validar(datos) {
  const codigo = limpiar(datos.codigo, 20);
  if (!/^[A-Za-z0-9\-_.]{2,20}$/.test(codigo)) {
    return { error: "El código solo puede tener letras, números y guiones (de 2 a 20 caracteres)." };
  }
  const nombres = limpiar(datos.nombres);
  const apellidos = limpiar(datos.apellidos);
  if (!nombres || !apellidos) return { error: "Escribe nombres y apellidos." };
  if (!patrullas.some((p) => p.nombre === datos.patrulla)) return { error: "Elige una patrulla." };

  const rol = datos.rol ?? "";
  if (rol && !roles.includes(rol)) return { error: "El rol no es válido." };

  const ingreso = datos.ingreso ?? "";
  if (ingreso && !/^\d{4}-\d{2}-\d{2}$/.test(ingreso)) return { error: "La fecha de ingreso no es válida." };

  return {
    datos: { codigo, nombres, apellidos, patrulla: datos.patrulla, rol, ingreso, activo: datos.activo !== false },
  };
}

export async function obtenerIntegrantes() {
  if (!(await correoDirigente())) return { ok: false, error: "No tienes permiso." };
  try {
    return { ok: true, integrantes: await listarIntegrantes() };
  } catch (error) {
    console.error("Error al leer integrantes", error);
    return { ok: false, error: "No se pudo cargar la lista." };
  }
}

export async function guardarIntegrante(datos) {
  if (!(await correoDirigente())) return { ok: false, error: "No tienes permiso." };
  const validado = validar(datos);
  if (validado.error) return { ok: false, error: validado.error };
  try {
    const resultado = await crearIntegrante(validado.datos);
    if (resultado.ok) updateTag("asistencia");
    return resultado;
  } catch (error) {
    console.error("Error al crear integrante", error);
    return { ok: false, error: "No se pudo guardar. Intenta de nuevo." };
  }
}

export async function modificarIntegrante(datos) {
  if (!(await correoDirigente())) return { ok: false, error: "No tienes permiso." };
  const validado = validar(datos);
  if (validado.error) return { ok: false, error: validado.error };
  try {
    const resultado = await actualizarIntegrante(validado.datos);
    if (resultado.ok) updateTag("asistencia");
    return resultado;
  } catch (error) {
    console.error("Error al editar integrante", error);
    return { ok: false, error: "No se pudo guardar. Intenta de nuevo." };
  }
}