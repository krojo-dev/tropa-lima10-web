import { google } from "googleapis";
import { randomUUID } from "node:crypto";

const PESTANA = "Puntajes";

function clienteSheets() {
  const credenciales = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth: credenciales });
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
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${PESTANA}!A2:J`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  return (respuesta.data.values ?? []).map((f, i) => ({
    indice: i + 1,
    fecha: typeof f[0] === "number" ? serialAFecha(f[0]) : String(f[0] ?? ""),
    patrulla: String(f[1] ?? ""),
    categoria: String(f[2] ?? ""),
    detalle: String(f[3] ?? ""),
    puntos: Number(f[4]) || 0,
    lote: String(f[5] ?? ""),
    registradoPor: String(f[6] ?? ""),
    hora: String(f[7] ?? ""),
    editadoPor: String(f[8] ?? ""),
    horaEdicion: String(f[9] ?? ""),
  }));
}

async function borrarFilas(sheets, indices) {
  if (indices.length === 0) return;
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    fields: "sheets.properties",
  });
  const hoja = meta.data.sheets.find((s) => s.properties.title === PESTANA);
  const sheetId = hoja.properties.sheetId;

  const ordenados = [...indices].sort((a, b) => b - a);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    requestBody: {
      requests: ordenados.map((i) => ({
        deleteDimension: {
          range: { sheetId, dimension: "ROWS", startIndex: i, endIndex: i + 1 },
        },
      })),
    },
  });
}

async function anexar(sheets, filas) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${PESTANA}!A:J`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: filas },
  });
}

function construirFilas({ fecha, categoria, detalle, valores, lote, registradoPor, hora, editadoPor = "", horaEdicion = "" }) {
  return valores.map((v) => [
    fecha,
    v.patrulla,
    categoria,
    detalle,
    v.puntos,
    lote,
    registradoPor,
    `'${hora}`,
    editadoPor,
    horaEdicion ? `'${horaEdicion}` : "",
  ]);
}

export async function agregarRegistro({ fecha, categoria, detalle, valores, correo }) {
  const sheets = clienteSheets();
  const lote = `L-${randomUUID().slice(0, 8)}`;
  const filas = construirFilas({
    fecha, categoria, detalle, valores, lote,
    registradoPor: correo,
    hora: ahoraEnLima(),
  });
  await anexar(sheets, filas);
  return lote;
}

export async function listarRegistros(fecha) {
  const sheets = clienteSheets();
  const filas = (await leerFilas(sheets)).filter((f) => f.fecha === fecha && f.lote);

  const grupos = new Map();
  filas.forEach((f) => {
    if (!grupos.has(f.lote)) {
      grupos.set(f.lote, {
        lote: f.lote,
        fecha: f.fecha,
        categoria: f.categoria,
        detalle: f.detalle,
        registradoPor: f.registradoPor,
        hora: f.hora,
        editadoPor: f.editadoPor,
        horaEdicion: f.horaEdicion,
        valores: [],
      });
    }
    grupos.get(f.lote).valores.push({ patrulla: f.patrulla, puntos: f.puntos });
  });

  return [...grupos.values()].sort((a, b) => b.hora.localeCompare(a.hora));
}

export async function eliminarLote(lote) {
  const sheets = clienteSheets();
  const filas = await leerFilas(sheets);
  const indices = filas.filter((f) => f.lote === lote).map((f) => f.indice);
  if (indices.length === 0) return false;
  await borrarFilas(sheets, indices);
  return true;
}

export async function reemplazarLote({ lote, fecha, categoria, detalle, valores, correo }) {
  const sheets = clienteSheets();
  const antes = (await leerFilas(sheets)).filter((f) => f.lote === lote);
  if (antes.length === 0) return false;
  const original = antes[0];

  const nuevas = construirFilas({
    fecha, categoria, detalle, valores, lote,
    registradoPor: original.registradoPor,
    hora: original.hora,
    editadoPor: correo,
    horaEdicion: ahoraEnLima(),
  });
  await anexar(sheets, nuevas);

  const despues = (await leerFilas(sheets)).filter((f) => f.lote === lote);
  const viejas = despues.slice(0, despues.length - nuevas.length).map((f) => f.indice);
  await borrarFilas(sheets, viejas);
  return true;
}