import { google } from "googleapis";

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

async function leerFechas(sheets) {
  const respuesta = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${PESTANA}!A2:A`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  return (respuesta.data.values ?? []).map((fila) => {
    const valor = fila[0];
    return typeof valor === "number" ? serialAFecha(valor) : String(valor ?? "");
  });
}

async function borrarFilas(sheets, indices) {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    fields: "sheets.properties",
  });
  const hoja = meta.data.sheets.find((s) => s.properties.title === PESTANA);
  const sheetId = hoja.properties.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    requestBody: {
      requests: indices.map((i) => ({
        deleteDimension: {
          range: { sheetId, dimension: "ROWS", startIndex: i, endIndex: i + 1 },
        },
      })),
    },
  });
}

export async function guardarEnHoja(fecha, filas, reemplazar) {
  const sheets = clienteSheets();

  const fechas = await leerFechas(sheets);
  const indices = fechas
    .map((f, i) => (f === fecha ? i + 1 : -1))
    .filter((i) => i >= 0)
    .sort((a, b) => b - a);

  if (indices.length > 0 && !reemplazar) {
    return { duplicada: true };
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${PESTANA}!A:E`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: filas },
  });

  if (indices.length > 0) {
    await borrarFilas(sheets, indices);
  }

  return { duplicada: false };
}