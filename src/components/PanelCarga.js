"use client";
import { useState } from "react";
import SeccionPuntajes from "./SeccionPuntajes";
import SeccionAsistencia from "./SeccionAsistencia";
import SeccionIntegrantes from "./SeccionIntegrantes";
import SeccionResumen from "./SeccionResumen";

const secciones = [
  { id: "puntajes", texto: "🏆 Puntajes" },
  { id: "asistencia", texto: "✅ Asistencia" },
  { id: "integrantes", texto: "👥 Integrantes" },
  { id: "resumen", texto: "📊 Resumen" },
];

export default function PanelCarga({ miPatrulla = "" }) {
  const [seccion, setSeccion] = useState("puntajes");

  return (
    <div className="space-y-6">
      <nav className="flex gap-2 overflow-x-auto border-b pb-2">
        {secciones.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSeccion(s.id)}
            className={`shrink-0 rounded-t-lg px-4 py-2 font-bold ${
              seccion === s.id ? "border-b-4 border-verde text-verde" : "text-gray-500"
            }`}
          >
            {s.texto}
          </button>
        ))}
      </nav>

      {seccion === "puntajes" && <SeccionPuntajes />}
      {seccion === "asistencia" && <SeccionAsistencia miPatrulla={miPatrulla} />}
      {seccion === "integrantes" && <SeccionIntegrantes miPatrulla={miPatrulla} />}
      {seccion === "resumen" && <SeccionResumen />}
    </div>
  );
}