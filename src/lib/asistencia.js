import { cacheLife, cacheTag } from "next/cache";
import { clienteSheets } from "@/lib/google";
import { listarIntegrantes } from "@/lib/registro";
import { patrullas } from "@/data/datos";
import { calcularResumenDirigentes } from "@/lib/estadisticasAsistencia";

const HOJA = "Asistencia";

function texto(valor) {
  return String(valor ?? "").trim();
}

function serialAFecha(serial) {
  const milisegundos = Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000;
  return new Date(milisegundos).toISOString().slice(0, 10);
}

function ahoraEnLima() {
  return new Date().toLocaleString("sv-SE", { timeZone: "America/Lima" });
}

async function leerFilas(sheets) {
  const respuesta = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.REGISTRO_SHEET_ID,
    range: `${HOJA}!A2:J`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  return (respuesta.data.values ?? [])
    .map((f, i) => ({
      fila: i + 2,
      fecha: typeof f[0] === "number" ? serialAFecha(f[0]) : texto(f[0]),
      codigo: texto(f[1]),
      patrulla: texto(f[3]),
      estado: texto(f[5]),
      registradoPor: texto(f[6]),
      hora: texto(f[7]),
    }))
    .filter((x) => x.fecha && x.codigo);
}

export async function leerAsistenciaDelDia(fecha) {
  const filas = await leerFilas(clienteSheets());
  const marcas = {};
  filas
    .filter((f) => f.fecha === fecha)
    .forEach((f) => {
      marcas[f.codigo] = f.estado;
    });
  return marcas;
}

export async function guardarMarcas({ fecha, marcas, correo }) {
  const sheets = clienteSheets();
  const [integrantes, filas] = await Promise.all([listarIntegrantes(), leerFilas(sheets)]);

  const activos = new Map(
    integrantes.filter((i) => i.activo).map((i) => [i.codigo.toLowerCase(), i])
  );

  const delDia = new Map();
  filas
    .filter((f) => f.fecha === fecha)
    .forEach((f) => {
      delDia.set(f.codigo.toLowerCase(), f);
    });

  const ahora = ahoraEnLima();
  const nuevas = [];
  const actualizaciones = [];
  let omitidas = 0;

  for (const marca of marcas) {
    const clave = marca.codigo.toLowerCase();
    const persona = activos.get(clave);
    if (!persona) {
      omitidas++;
      continue;
    }

    const existente = delDia.get(clave);
    if (existente) {
      if (existente.estado === marca.estado) continue;
      actualizaciones.push({
        range: `${HOJA}!F${existente.fila}:J${existente.fila}`,
        values: [[marca.estado, existente.registradoPor, existente.hora, correo, ahora]],
      });
    } else {
      nuevas.push([
        fecha,
        persona.codigo,
        `${persona.nombres} ${persona.apellidos}`,
        persona.patrulla,
        persona.rol,
        marca.estado,
        correo,
        ahora,
        "",
        "",
      ]);
    }
  }

  if (actualizaciones.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.REGISTRO_SHEET_ID,
      requestBody: { valueInputOption: "RAW", data: actualizaciones },
    });
  }
  if (nuevas.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.REGISTRO_SHEET_ID,
      range: `${HOJA}!A:J`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: nuevas },
    });
  }

  return { nuevas: nuevas.length, actualizadas: actualizaciones.length, omitidas };
}

export async function leerAsistenciaPublica() {
  "use cache";
  cacheLife({ stale: 30, revalidate: 1800, expire: 86400 });
  cacheTag("asistencia");

  try {
    const filas = await leerFilas(clienteSheets());
    return filas.map((f) => ({ fecha: f.fecha, patrulla: f.patrulla, estado: f.estado }));
  } catch (error) {
    console.error("No se pudo leer la asistencia pública", error);
    return [];
  }
}

export async function resumenDirigentesCacheado(hoy) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 1800, expire: 86400 });
  cacheTag("asistencia");

  const [filas, integrantes] = await Promise.all([
    leerFilas(clienteSheets()),
    listarIntegrantes(),
  ]);
  return calcularResumenDirigentes({
    filas,
    integrantes,
    hoy,
    nombresPatrullas: patrullas.map((p) => p.nombre),
  });
}