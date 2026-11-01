"use client";
import { useState } from "react";
import FormularioRegistro from "./FormularioRegistro";
import HistorialRegistros from "./HistorialRegistros";

export default function PanelCarga() {
  const [pestana, setPestana] = useState("registrar");
  const [editando, setEditando] = useState(null);

  function clasePestana(nombre) {
    return `flex-1 rounded-full py-2 font-bold ${
      pestana === nombre ? "bg-verde text-white" : "border-2 border-verde text-verde"
    }`;
  }

  if (editando) {
    return (
      <FormularioRegistro
        key={editando.lote}
        registroInicial={editando}
        onGuardado={() => {
          setEditando(null);
          setPestana("historial");
        }}
        onCancelar={() => setEditando(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <button type="button" onClick={() => setPestana("registrar")} className={clasePestana("registrar")}>
          ➕ Registrar
        </button>
        <button type="button" onClick={() => setPestana("historial")} className={clasePestana("historial")}>
          📋 Historial
        </button>
      </div>

      {pestana === "registrar" ? (
        <FormularioRegistro />
      ) : (
        <HistorialRegistros onEditar={setEditando} />
      )}
    </div>
  );
}