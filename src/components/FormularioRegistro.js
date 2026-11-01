"use client";
import { useState } from "react";
import { registrarPuntajes, actualizarRegistro } from "@/app/puntajes/admin/acciones";
import { patrullas, fondoPatrulla } from "@/data/datos";
import { categorias } from "@/lib/puntajes";

function hoyEnLima() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });
}

export default function FormularioRegistro({ registroInicial = null, onGuardado, onCancelar }) {
  const editando = Boolean(registroInicial);

  const [fecha, setFecha] = useState(registroInicial?.fecha ?? hoyEnLima());
  const [categoria, setCategoria] = useState(registroInicial?.categoria ?? "Juegos");
  const [detalle, setDetalle] = useState(registroInicial?.detalle ?? "");
  const [tipo, setTipo] = useState(
    registroInicial?.valores.some((v) => v.puntos < 0) ? "restar" : "sumar"
  );
  const [puntos, setPuntos] = useState(() => {
    const inicial = {};
    registroInicial?.valores.forEach((v) => {
      inicial[v.patrulla] = String(Math.abs(v.puntos));
    });
    return inicial;
  });
  const [estado, setEstado] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setEstado(null);

    const datos = { fecha, categoria, detalle, tipo, puntos };
    const resultado = editando
      ? await actualizarRegistro({ lote: registroInicial.lote, ...datos })
      : await registrarPuntajes(datos);

    setEnviando(false);

    if (!resultado.ok) {
      setEstado({ tipo: "error", texto: resultado.error });
      return;
    }
    if (editando) {
      onGuardado?.();
      return;
    }
    setEstado({ tipo: "ok", texto: `✅ Guardado para ${resultado.total} patrulla(s).` });
    setPuntos({});
    setDetalle("");
  }

  const campo = "w-full rounded-lg border border-gray-300 px-3 py-2";
  const resta = tipo === "restar";
  const textoDetalle = resta
    ? "Observación (obligatoria al restar)"
    : categoria === "Juegos"
      ? "Nombre del juego (obligatorio)"
      : "Observación (opcional)";

  return (
    <form onSubmit={enviar} className="space-y-5">
      {editando && (
        <p className="rounded-lg bg-yellow-100 p-3 text-sm text-yellow-900">
          ✏️ Estás editando un registro existente.
        </p>
      )}

      <div className="grid gap-4 rounded-xl bg-white p-5 shadow md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block font-bold">📅 Fecha</span>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={campo} />
        </label>
        <label className="block">
          <span className="mb-1 block font-bold">📂 Categoría</span>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={campo}>
            {categorias.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1 block font-bold">📝 Detalle</span>
          <input
            type="text"
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            placeholder={textoDetalle}
            maxLength={80}
            className={campo}
          />
        </label>

        <div className="md:col-span-2">
          <span className="mb-1 block font-bold">➕➖ Tipo</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTipo("sumar")}
              className={`rounded-lg border-2 py-2 font-bold ${
                !resta ? "border-verde bg-verde text-white" : "border-gray-300 text-gray-600"
              }`}
            >
              Sumar
            </button>
            <button
              type="button"
              onClick={() => setTipo("restar")}
              className={`rounded-lg border-2 py-2 font-bold ${
                resta ? "border-red-600 bg-red-600 text-white" : "border-gray-300 text-gray-600"
              }`}
            >
              Restar
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {patrullas.map((p) => (
          <div key={p.nombre} className="flex items-center gap-3 overflow-hidden rounded-xl bg-white shadow">
            <div className="h-16 w-3 shrink-0" style={{ background: fondoPatrulla(p.colores) }} />
            <span className="flex-1 text-lg font-bold">{p.nombre}</span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              placeholder="0"
              value={puntos[p.nombre] ?? ""}
              onChange={(e) => setPuntos({ ...puntos, [p.nombre]: e.target.value })}
              className="mr-3 w-24 rounded-lg border border-gray-300 px-3 py-2 text-right text-lg"
            />
          </div>
        ))}
        <p className="text-sm text-gray-600">
          Escribe siempre el número en positivo. Deja vacía la patrulla que no recibe puntos.
        </p>
      </div>

      {estado?.tipo === "error" && (
        <p className="rounded-lg bg-red-100 p-4 text-red-800">{estado.texto}</p>
      )}
      {estado?.tipo === "ok" && (
        <p className="rounded-lg bg-green-100 p-4 text-green-800">{estado.texto}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={enviando}
          className={`flex-1 rounded-full py-3 text-lg font-bold text-white disabled:opacity-50 ${
            resta ? "bg-red-600 hover:bg-red-700" : "bg-verde hover:bg-verde-oscuro"
          }`}
        >
          {enviando ? "Guardando..." : editando ? "Guardar cambios" : resta ? "Restar puntos" : "Guardar puntos"}
        </button>
        {editando && (
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-full border-2 border-gray-400 px-6 py-3 font-bold text-gray-600"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}