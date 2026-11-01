"use client";
import { useEffect, useState } from "react";
import { listarRegistrosDelDia, eliminarRegistro } from "@/app/puntajes/admin/acciones";

function hoyEnLima() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });
}

function formatoPuntos(n) {
  return n > 0 ? `+${n}` : String(n);
}

function nombreCorto(correo) {
  return String(correo ?? "").split("@")[0];
}

export default function HistorialRegistros({ onEditar }) {
  const [fecha, setFecha] = useState(hoyEnLima());
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [confirmando, setConfirmando] = useState(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setCargando(true);
      setError("");
      const resultado = await listarRegistrosDelDia(fecha);
      if (cancelado) return;
      if (resultado.ok) setRegistros(resultado.registros);
      else setError(resultado.error);
      setCargando(false);
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [fecha, recarga]);

  async function borrar(lote) {
    const resultado = await eliminarRegistro(lote);
    setConfirmando(null);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setRecarga((n) => n + 1);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3 rounded-xl bg-white p-4 shadow">
        <label className="flex-1">
          <span className="mb-1 block font-bold">📅 Fecha</span>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={() => setRecarga((n) => n + 1)}
          className="rounded-full border-2 border-verde px-4 py-2 font-bold text-verde"
        >
          ↻ Actualizar
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-100 p-4 text-red-800">{error}</p>}
      {cargando && <p className="py-6 text-center">Cargando...</p>}
      {!cargando && !error && registros.length === 0 && (
        <p className="py-6 text-center text-gray-600">No hay registros para esta fecha.</p>
      )}

      {registros.map((r) => (
        <div key={r.lote} className="rounded-xl border-l-8 border-verde bg-white p-4 shadow">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold">{r.categoria}</p>
              {r.detalle && <p className="text-sm">{r.detalle}</p>}
            </div>
            <p className="shrink-0 text-xs text-gray-500">{r.hora.slice(11, 16)}</p>
          </div>

          <ul className="my-3 flex flex-wrap gap-2">
            {r.valores.map((v) => (
              <li
                key={v.patrulla}
                className={`rounded-full px-3 py-1 text-sm font-bold ${
                  v.puntos < 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                }`}
              >
                {v.patrulla} {formatoPuntos(v.puntos)}
              </li>
            ))}
          </ul>

          <p className="text-xs text-gray-500">
            Registrado por {nombreCorto(r.registradoPor)}
            {r.editadoPor && ` · Editado por ${nombreCorto(r.editadoPor)} a las ${r.horaEdicion.slice(11, 16)}`}
          </p>

          <div className="mt-3 flex gap-3">
            {confirmando === r.lote ? (
              <>
                <span className="self-center text-sm font-bold">¿Eliminar este registro?</span>
                <button
                  type="button"
                  onClick={() => borrar(r.lote)}
                  className="rounded-full bg-red-600 px-4 py-1 text-sm font-bold text-white"
                >
                  Sí, eliminar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmando(null)}
                  className="rounded-full border-2 border-gray-400 px-4 py-1 text-sm font-bold text-gray-600"
                >
                  No
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onEditar(r)}
                  className="rounded-full border-2 border-verde px-4 py-1 text-sm font-bold text-verde"
                >
                  ✏️ Editar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmando(r.lote)}
                  className="rounded-full border-2 border-red-600 px-4 py-1 text-sm font-bold text-red-600"
                >
                  🗑️ Eliminar
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}