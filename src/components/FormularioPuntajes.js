"use client";
import { useState } from "react";
import { guardarPuntajes } from "@/app/puntajes/admin/acciones";
import { patrullas, fondoPatrulla } from "@/data/datos";
import { categorias } from "@/lib/puntajes";

const otrasCategorias = categorias.filter((c) => c !== "Juegos");

function hoyEnLima() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });
}

export default function FormularioPuntajes() {
  const [fecha, setFecha] = useState(hoyEnLima());
  const [juegos, setJuegos] = useState([""]);
  const [puntos, setPuntos] = useState({});
  const [estado, setEstado] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function cambiarPunto(clave, valor) {
    setPuntos((anterior) => ({ ...anterior, [clave]: valor }));
  }

  function cambiarNombreJuego(indice, valor) {
    setJuegos((anterior) => anterior.map((n, i) => (i === indice ? valor : n)));
  }

  function construirLineas() {
    const lineas = [];
    patrullas.forEach((p) => {
      juegos.forEach((nombre, i) => {
        const valor = puntos[`${p.nombre}|j${i}`];
        if (valor !== undefined && valor !== "") {
          const nombreLimpio = nombre.trim();
          lineas.push({
            patrulla: p.nombre,
            categoria: "Juegos",
            detalle: nombreLimpio ? `J${i + 1}: ${nombreLimpio}` : `J${i + 1}`,
            puntos: valor,
          });
        }
      });
      otrasCategorias.forEach((c) => {
        const valor = puntos[`${p.nombre}|${c}`];
        if (valor !== undefined && valor !== "") {
          lineas.push({ patrulla: p.nombre, categoria: c, detalle: "", puntos: valor });
        }
      });
    });
    return lineas;
  }

  async function enviar(reemplazar) {
    const lineas = construirLineas();
    if (!fecha) {
      setEstado({ tipo: "error", texto: "Elige la fecha de la reunión." });
      return;
    }
    if (lineas.length === 0) {
      setEstado({ tipo: "error", texto: "Ingresa al menos un puntaje." });
      return;
    }

    setEnviando(true);
    setEstado(null);
    const resultado = await guardarPuntajes({ fecha, lineas, reemplazar });
    setEnviando(false);

    if (resultado.ok) {
      setEstado({ tipo: "ok", texto: `✅ Guardado: ${resultado.total} puntajes del ${fecha}.` });
      setPuntos({});
      setJuegos([""]);
    } else if (resultado.duplicada) {
      setEstado({ tipo: "duplicada" });
    } else {
      setEstado({ tipo: "error", texto: resultado.error });
    }
  }

  const campo = "w-full rounded-lg border border-gray-300 px-3 py-2";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        enviar(false);
      }}
      className="space-y-6"
    >
      <div className="rounded-xl bg-white p-5 shadow">
        <label className="mb-1 block font-bold">📅 Fecha de la reunión</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={campo} />
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <h3 className="mb-3 font-bold">🎮 Juegos de hoy (el nombre es opcional)</h3>
        <div className="space-y-2">
          {juegos.map((nombre, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-10 font-bold">J{i + 1}</span>
              <input
                type="text"
                value={nombre}
                onChange={(e) => cambiarNombreJuego(i, e.target.value)}
                placeholder="Ej: Carrera de nudos"
                maxLength={40}
                className={campo}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={() => setJuegos([...juegos, ""])}
            className="rounded-full bg-verde px-4 py-2 text-sm font-bold text-white"
          >
            + Agregar juego
          </button>
          {juegos.length > 1 && (
            <button
              type="button"
              onClick={() => setJuegos(juegos.slice(0, -1))}
              className="rounded-full border-2 border-gray-400 px-4 py-2 text-sm font-bold text-gray-600"
            >
              Quitar último
            </button>
          )}
        </div>
      </div>

      {patrullas.map((p) => (
        <div key={p.nombre} className="overflow-hidden rounded-xl bg-white shadow">
          <div className="h-3" style={{ background: fondoPatrulla(p.colores) }} />
          <div className="p-5">
            <h3 className="mb-3 text-xl font-bold">{p.nombre}</h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {juegos.map((nombre, i) => (
                <label key={i} className="block text-sm">
                  <span className="font-bold">J{i + 1}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={puntos[`${p.nombre}|j${i}`] ?? ""}
                    onChange={(e) => cambiarPunto(`${p.nombre}|j${i}`, e.target.value)}
                    className={campo}
                  />
                </label>
              ))}
              {otrasCategorias.map((c) => (
                <label key={c} className="block text-sm">
                  <span className="font-bold">{c}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={puntos[`${p.nombre}|${c}`] ?? ""}
                    onChange={(e) => cambiarPunto(`${p.nombre}|${c}`, e.target.value)}
                    className={campo}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}

      {estado?.tipo === "error" && (
        <p className="rounded-lg bg-red-100 p-4 text-red-800">{estado.texto}</p>
      )}
      {estado?.tipo === "ok" && (
        <p className="rounded-lg bg-green-100 p-4 text-green-800">{estado.texto}</p>
      )}
      {estado?.tipo === "duplicada" && (
        <div className="rounded-lg bg-yellow-100 p-4 text-yellow-900">
          <p className="mb-3 font-bold">⚠️ Ya hay puntajes registrados para el {fecha}.</p>
          <p className="mb-3 text-sm">¿Quieres reemplazarlos por los que acabas de ingresar?</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => enviar(true)}
              className="rounded-full bg-yellow-500 px-4 py-2 text-sm font-bold text-black"
            >
              Sí, reemplazar
            </button>
            <button
              type="button"
              onClick={() => setEstado(null)}
              className="rounded-full border-2 border-yellow-700 px-4 py-2 text-sm font-bold"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-full bg-verde py-3 text-lg font-bold text-white hover:bg-verde-oscuro disabled:opacity-50"
      >
        {enviando ? "Guardando..." : "Guardar puntajes"}
      </button>
    </form>
  );
}