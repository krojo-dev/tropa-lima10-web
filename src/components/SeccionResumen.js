"use client";
import { useCallback, useEffect, useState } from "react";
import {
  obtenerResumenDirigentes,
  refrescarDatos,
} from "@/app/puntajes/admin/acciones-asistencia";

function pct(r) {
  return r.porcentaje === null ? "—" : `${r.porcentaje}%`;
}

function colorPorcentaje(porcentaje, umbral) {
  if (porcentaje === null) return "bg-gray-100 text-gray-500";
  if (porcentaje < umbral) return "bg-red-100 text-red-800";
  if (porcentaje < 85) return "bg-yellow-100 text-yellow-900";
  return "bg-green-100 text-green-800";
}

function Dato({ titulo, resumen, umbral }) {
  return (
    <div className={`rounded-lg p-3 text-center ${colorPorcentaje(resumen.porcentaje, umbral)}`}>
      <p className="text-xs font-bold uppercase">{titulo}</p>
      <p className="text-2xl font-extrabold">{pct(resumen)}</p>
      <p className="text-[11px]">
        {resumen.asistio + resumen.tardanza}/{resumen.total}
      </p>
    </div>
  );
}

export default function SeccionResumen() {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");
  const [actualizado, setActualizado] = useState("");
  const [refrescando, setRefrescando] = useState(false);  

  const cargar = useCallback(async () => {
    const resultado = await obtenerResumenDirigentes();
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setError("");
    setResumen(resultado.resumen);
    setActualizado(
      new Date().toLocaleTimeString("es-PE", {
        timeZone: "America/Lima",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  }, []);

    async function refrescarAhora() {
    setRefrescando(true);
    await refrescarDatos();
    await cargar();
    setRefrescando(false);
  }

  useEffect(() => {
    cargar();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") cargar();
    }, 15000);
    return () => clearInterval(id);
  }, [cargar]);

  if (error) return <p className="rounded-lg bg-red-100 p-4 text-red-800">{error}</p>;
  if (!resumen) return <p className="py-6 text-center">Cargando resumen...</p>;

  if (!resumen.hayDatos) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow">
        <p className="text-xl font-bold text-verde">Aún no hay asistencias registradas</p>
        <p className="mt-2 text-gray-600">
          Cuando pases lista por primera vez, aquí verás el resumen en vivo.
        </p>
      </div>
    );
  }

  const u = resumen.umbral;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-5 shadow">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-verde">
            {resumen.esHoy ? "Reunión de hoy" : "Última reunión registrada"} · {resumen.fechaRef}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">🔴 En vivo · actualizado {actualizado}</span>
            <button
              type="button"
              onClick={refrescarAhora}
              disabled={refrescando}
              className="rounded-full border-2 border-verde px-3 py-1 text-xs font-bold text-verde disabled:opacity-50"
            >
              {refrescando ? "Actualizando..." : "↻ Actualizar datos ahora"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <p className="text-5xl font-extrabold text-verde">{pct(resumen.dia)}</p>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">
              ✅ {resumen.dia.asistio} asistieron
            </span>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-900">
              ⏰ {resumen.dia.tardanza} tardanzas
            </span>
            <span className="rounded-full bg-red-100 px-3 py-1 text-red-800">
              ❌ {resumen.dia.falta} faltas
            </span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">
              📄 {resumen.dia.justificada} justificadas
            </span>
            {resumen.pendientes !== null && (
              <span className="rounded-full bg-gray-200 px-3 py-1 text-gray-700">
                ⏳ {resumen.pendientes} pendientes de {resumen.activos}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-3 text-xl font-bold text-verde">Toda la tropa</h2>
        <div className="grid grid-cols-3 gap-3">
          <Dato titulo="Semana" resumen={resumen.tropa.semana} umbral={u} />
          <Dato titulo="Mes" resumen={resumen.tropa.mes} umbral={u} />
          <Dato titulo="Año" resumen={resumen.tropa.anio} umbral={u} />
        </div>
        {resumen.tropa.anio.porcentajeJustificacion !== null && (
          <p className="mt-3 text-sm text-gray-600">
            📄 De las inasistencias del año, el{" "}
            <b>{resumen.tropa.anio.porcentajeJustificacion}%</b> fueron justificadas o avisadas.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-verde">Por patrulla</h2>
        {resumen.porPatrulla.map((p) => (
          <div key={p.patrulla} className="rounded-xl bg-white p-4 shadow">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-bold">{p.patrulla}</h3>
              <span className="text-xs text-gray-500">
                {p.integrantes} activos
                {p.pendientes !== null && ` · ${p.pendientes} pendientes hoy`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Dato titulo="Reunión" resumen={p.dia} umbral={u} />
              <Dato titulo="Semana" resumen={p.semana} umbral={u} />
              <Dato titulo="Mes" resumen={p.mes} umbral={u} />
              <Dato titulo="Año" resumen={p.anio} umbral={u} />
            </div>
            {p.anio.porcentajeJustificacion !== null && (
              <p className="mt-3 text-xs text-gray-600">
                📄 Faltas justificadas en el año: {p.anio.porcentajeJustificacion}% de las inasistencias.
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-1 text-xl font-bold text-verde">⚠️ Alertas de asistencia</h2>
        <p className="mb-3 text-xs text-gray-500">
          Integrantes activos con menos de {u}% en los últimos {resumen.diasAlerta} días (mínimo
          2 registros).
        </p>
        {resumen.alertas.length === 0 ? (
          <p className="text-sm text-green-700">🎉 Nadie está por debajo del {u}%.</p>
        ) : (
          <ul className="divide-y">
            {resumen.alertas.map((a) => (
              <li key={a.codigo} className="flex items-center justify-between gap-3 py-2">
                <div>
                  <p className="font-bold">{a.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {a.patrulla} · {a.asistencias} de {a.total} reuniones
                  </p>
                </div>
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-800">
                  {a.porcentaje}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}