import { inicioSemana, etiquetaSemana, etiquetaMes } from "@/lib/puntajes";

export const UMBRAL_ALERTA = 70;
export const DIAS_ALERTA = 30;
export const MIN_REGISTROS_ALERTA = 2;

function fechaCorta(fecha) {
  const [, mes, dia] = fecha.split("-");
  return `${dia}/${mes}`;
}

function restarDias(fecha, dias) {
  const d = new Date(fecha + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
}

export function resumenAsistencia(filas) {
  const r = { asistio: 0, tardanza: 0, falta: 0, justificada: 0 };
  filas.forEach((f) => {
    if (f.estado === "Asistió") r.asistio++;
    else if (f.estado === "Tardanza") r.tardanza++;
    else if (f.estado === "Falta") r.falta++;
    else if (f.estado === "Falta justificada") r.justificada++;
  });

  const total = r.asistio + r.tardanza + r.falta + r.justificada;
  const inasistencias = r.falta + r.justificada;

  return {
    ...r,
    total,
    porcentaje: total > 0 ? Math.round(((r.asistio + r.tardanza) / total) * 100) : null,
    porcentajeJustificacion:
      inasistencias > 0 ? Math.round((r.justificada / inasistencias) * 100) : null,
  };
}

export function dividirPorPeriodo(filas) {
  if (filas.length === 0) return null;
  const ultima = filas.map((f) => f.fecha).sort().at(-1);
  const semana = inicioSemana(ultima);
  const mes = ultima.slice(0, 7);
  const anio = ultima.slice(0, 4);

  return {
    ultima,
    semana,
    mes,
    anio,
    semanaFilas: filas.filter((f) => inicioSemana(f.fecha) === semana),
    mesFilas: filas.filter((f) => f.fecha.startsWith(mes)),
    anioFilas: filas.filter((f) => f.fecha.startsWith(anio)),
  };
}

export function porReunion(filas, cantidad = 8) {
  const fechas = [...new Set(filas.map((f) => f.fecha))].sort().slice(-cantidad);
  return fechas.map((fecha) => {
    const r = resumenAsistencia(filas.filter((f) => f.fecha === fecha));
    return { fecha, etiqueta: fechaCorta(fecha), porcentaje: r.porcentaje ?? 0 };
  });
}

export function tableroAsistenciaPatrulla(todas, nombre) {
  const periodos = dividirPorPeriodo(todas);
  if (!periodos) return null;

  const deLaPatrulla = (lista) => lista.filter((f) => f.patrulla === nombre);
  if (deLaPatrulla(todas).length === 0) return null;

  return {
    etiquetas: {
      semana: etiquetaSemana(periodos.semana),
      mes: etiquetaMes(periodos.mes),
      anio: periodos.anio,
    },
    semana: resumenAsistencia(deLaPatrulla(periodos.semanaFilas)),
    mes: resumenAsistencia(deLaPatrulla(periodos.mesFilas)),
    anio: resumenAsistencia(deLaPatrulla(periodos.anioFilas)),
    porReunion: porReunion(deLaPatrulla(periodos.anioFilas), 8),
  };
}

function calcularAlertas(filas, activosPorCodigo, hasta) {
  const desde = restarDias(hasta, DIAS_ALERTA);
  const ventana = filas.filter(
    (f) =>
      f.fecha > desde &&
      f.fecha <= hasta &&
      activosPorCodigo.has(f.codigo.toLowerCase())
  );

  const grupos = {};
  ventana.forEach((f) => {
    const clave = f.codigo.toLowerCase();
    if (!grupos[clave]) grupos[clave] = [];
    grupos[clave].push(f);
  });

  return Object.entries(grupos)
    .map(([clave, marcas]) => {
      const persona = activosPorCodigo.get(clave);
      const r = resumenAsistencia(marcas);
      return {
        codigo: persona.codigo,
        nombre: `${persona.nombres} ${persona.apellidos}`,
        patrulla: persona.patrulla,
        porcentaje: r.porcentaje,
        asistencias: r.asistio + r.tardanza,
        total: r.total,
      };
    })
    .filter((a) => a.total >= MIN_REGISTROS_ALERTA && a.porcentaje < UMBRAL_ALERTA)
    .sort((a, b) => a.porcentaje - b.porcentaje);
}

export function calcularResumenDirigentes({ filas, integrantes, hoy, nombresPatrullas }) {
  const activos = integrantes.filter((i) => i.activo);
  const activosPorCodigo = new Map(activos.map((i) => [i.codigo.toLowerCase(), i]));

  const periodos = dividirPorPeriodo(filas);
  if (!periodos) return { hayDatos: false, activos: activos.length };

  const esHoy = filas.some((f) => f.fecha === hoy);
  const fechaRef = esHoy ? hoy : periodos.ultima;
  const delDia = filas.filter((f) => f.fecha === fechaRef);
  const marcadosHoy = new Set(
    delDia.filter((f) => activosPorCodigo.has(f.codigo.toLowerCase())).map((f) => f.codigo.toLowerCase())
  );

  const porPatrulla = nombresPatrullas.map((nombre) => {
    const de = (lista) => lista.filter((f) => f.patrulla === nombre);
    const activosDe = activos.filter((i) => i.patrulla === nombre);
    return {
      patrulla: nombre,
      integrantes: activosDe.length,
      dia: resumenAsistencia(de(delDia)),
      pendientes: esHoy
        ? activosDe.filter((i) => !marcadosHoy.has(i.codigo.toLowerCase())).length
        : null,
      semana: resumenAsistencia(de(periodos.semanaFilas)),
      mes: resumenAsistencia(de(periodos.mesFilas)),
      anio: resumenAsistencia(de(periodos.anioFilas)),
    };
  });

  return {
    hayDatos: true,
    fechaRef,
    esHoy,
    umbral: UMBRAL_ALERTA,
    diasAlerta: DIAS_ALERTA,
    etiquetas: {
      semana: etiquetaSemana(periodos.semana),
      mes: etiquetaMes(periodos.mes),
      anio: periodos.anio,
    },
    activos: activos.length,
    pendientes: esHoy ? activos.length - marcadosHoy.size : null,
    dia: resumenAsistencia(delDia),
    tropa: {
      semana: resumenAsistencia(periodos.semanaFilas),
      mes: resumenAsistencia(periodos.mesFilas),
      anio: resumenAsistencia(periodos.anioFilas),
    },
    porPatrulla,
    alertas: calcularAlertas(filas, activosPorCodigo, periodos.ultima),
  };
}