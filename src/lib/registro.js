import { clienteSheets } from "@/lib/google";
import { maxIntegrantesPorPatrulla } from "@/data/datos";

const HOJA_INTEGRANTES = "Integrantes";
const HOJA_DIRIGENTES = "Dirigentes";

function texto(valor) {
  return String(valor ?? "").trim();
}

function aFechaTexto(valor) {
  if (typeof valor === "number") {
    const milisegundos = Date.UTC(1899, 11, 30) + Math.round(valor) * 86400000;
    return new Date(milisegundos).toISOString().slice(0, 10);
  }
  return texto(valor);
}

async function leerIntegrantes(sheets) {
  const respuesta = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.REGISTRO_SHEET_ID,
    range: `${HOJA_INTEGRANTES}!A2:G`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  return (respuesta.data.values ?? [])
    .map((f, i) => ({
      fila: i + 2,
      codigo: texto(f[0]),
      nombres: texto(f[1]),
      apellidos: texto(f[2]),
      patrulla: texto(f[3]),
      rol: texto(f[4]),
      activo: texto(f[5]).toLowerCase() !== "no",
      ingreso: aFechaTexto(f[6]),
    }))
    .filter((x) => x.codigo);
}

function aFila(d) {
  return [d.codigo, d.nombres, d.apellidos, d.patrulla, d.rol, d.activo ? "Sí" : "No", d.ingreso];
}

function comprobarCupo(existentes, datos, actual) {
  if (!datos.activo) return null;

  const yaOcupaCupo = actual?.activo && actual.patrulla === datos.patrulla;
  if (yaOcupaCupo) return null;

  const ocupados = existentes.filter(
    (x) =>
      x.activo &&
      x.patrulla === datos.patrulla &&
      x.codigo.toLowerCase() !== datos.codigo.toLowerCase()
  ).length;

  if (ocupados >= maxIntegrantesPorPatrulla) {
    return `${datos.patrulla} ya tiene ${maxIntegrantesPorPatrulla} integrantes activos (el máximo). Da de baja o cambia de patrulla a alguien primero.`;
  }
  return null;
}

function comprobarRoles(existentes, datos) {
  const rolUnico = datos.rol === "Guía" || datos.rol === "Subguía";
  if (!rolUnico || !datos.activo) return null;

  const otro = existentes.find(
    (x) =>
      x.activo &&
      x.patrulla === datos.patrulla &&
      x.rol === datos.rol &&
      x.codigo.toLowerCase() !== datos.codigo.toLowerCase()
  );
  if (otro) {
    return `${datos.patrulla} ya tiene como ${datos.rol} a ${otro.nombres} ${otro.apellidos}. Quítale primero ese rol.`;
  }
  return null;
}

export async function listarIntegrantes() {
  return leerIntegrantes(clienteSheets());
}

export async function crearIntegrante(datos) {
  const sheets = clienteSheets();
  const existentes = await leerIntegrantes(sheets);

  if (existentes.some((x) => x.codigo.toLowerCase() === datos.codigo.toLowerCase())) {
    return { ok: false, error: "Ya existe un integrante con ese código de registro." };
  }

  const nuevo = { ...datos, activo: true };
  const errorCupo = comprobarCupo(existentes, nuevo, null);
  if (errorCupo) return { ok: false, error: errorCupo };
  const errorRol = comprobarRoles(existentes, nuevo);
  if (errorRol) return { ok: false, error: errorRol };

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.REGISTRO_SHEET_ID,
    range: `${HOJA_INTEGRANTES}!A:G`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [aFila(nuevo)] },
  });
  return { ok: true };
}

export async function actualizarIntegrante(datos) {
  const sheets = clienteSheets();
  const existentes = await leerIntegrantes(sheets);

  const actual = existentes.find((x) => x.codigo.toLowerCase() === datos.codigo.toLowerCase());
  if (!actual) return { ok: false, error: "Ese integrante ya no existe." };

  const errorCupo = comprobarCupo(existentes, datos, actual);
  if (errorCupo) return { ok: false, error: errorCupo };
  const errorRol = comprobarRoles(existentes, datos);
  if (errorRol) return { ok: false, error: errorRol };

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.REGISTRO_SHEET_ID,
    range: `${HOJA_INTEGRANTES}!A${actual.fila}:G${actual.fila}`,
    valueInputOption: "RAW",
    requestBody: { values: [aFila({ ...datos, codigo: actual.codigo })] },
  });
  return { ok: true };
}

export async function patrullaDelDirigente(correo) {
  try {
    const sheets = clienteSheets();
    const respuesta = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.REGISTRO_SHEET_ID,
      range: `${HOJA_DIRIGENTES}!A2:C`,
    });
    const fila = (respuesta.data.values ?? []).find(
      (f) => texto(f[0]).toLowerCase() === String(correo ?? "").toLowerCase()
    );
    return fila ? texto(fila[2]) : "";
  } catch (error) {
    console.error("No se pudo leer la pestaña Dirigentes", error);
    return "";
  }
}