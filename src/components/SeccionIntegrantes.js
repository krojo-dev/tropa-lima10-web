"use client";
import { useEffect, useState } from "react";
import {
  obtenerIntegrantes,
  guardarIntegrante,
  modificarIntegrante,
} from "@/app/puntajes/admin/acciones-integrantes";
import { patrullas, roles } from "@/data/datos";

const campo = "w-full rounded-lg border border-gray-300 px-3 py-2";

function hoyEnLima() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });
}

function FormularioIntegrante({ inicial, patrullaInicial, onCancelar, onGuardado }) {
  const editando = Boolean(inicial);
  const [datos, setDatos] = useState(
    inicial ?? {
      codigo: "",
      nombres: "",
      apellidos: "",
      patrulla: patrullaInicial,
      rol: "",
      ingreso: hoyEnLima(),
      activo: true,
    }
  );
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(clave, valor) {
    setDatos((anterior) => ({ ...anterior, [clave]: valor }));
  }

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setError("");
    const resultado = editando ? await modificarIntegrante(datos) : await guardarIntegrante(datos);
    setEnviando(false);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    onGuardado();
  }

  return (
    <form onSubmit={enviar} className="space-y-4 rounded-xl bg-white p-5 shadow">
      <h3 className="text-xl font-bold text-verde">
        {editando ? "✏️ Editar integrante" : "➕ Nuevo integrante"}
      </h3>

      <label className="block">
        <span className="mb-1 block font-bold">Código de registro</span>
        <input
          value={datos.codigo}
          onChange={(e) => cambiar("codigo", e.target.value)}
          disabled={editando}
          maxLength={20}
          className={`${campo} ${editando ? "bg-gray-100" : ""}`}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block font-bold">Nombres</span>
          <input value={datos.nombres} onChange={(e) => cambiar("nombres", e.target.value)} className={campo} />
        </label>
        <label className="block">
          <span className="mb-1 block font-bold">Apellidos</span>
          <input value={datos.apellidos} onChange={(e) => cambiar("apellidos", e.target.value)} className={campo} />
        </label>
        <label className="block">
          <span className="mb-1 block font-bold">Patrulla</span>
          <select value={datos.patrulla} onChange={(e) => cambiar("patrulla", e.target.value)} className={campo}>
            {patrullas.map((p) => (
              <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block font-bold">Rol</span>
          <select value={datos.rol} onChange={(e) => cambiar("rol", e.target.value)} className={campo}>
            <option value="">Sin rol (período introductorio)</option>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block font-bold">Fecha de ingreso</span>
          <input
            type="date"
            value={datos.ingreso}
            onChange={(e) => cambiar("ingreso", e.target.value)}
            className={campo}
          />
        </label>
        {editando && (
          <label className="flex items-center gap-2 self-end pb-2">
            <input
              type="checkbox"
              checked={datos.activo}
              onChange={(e) => cambiar("activo", e.target.checked)}
              className="h-5 w-5"
            />
            <span className="font-bold">Activo</span>
          </label>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-100 p-3 text-red-800">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 rounded-full bg-verde py-3 font-bold text-white hover:bg-verde-oscuro disabled:opacity-50"
        >
          {enviando ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-full border-2 border-gray-400 px-6 py-3 font-bold text-gray-600"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function SeccionIntegrantes({ miPatrulla = "" }) {
  const [integrantes, setIntegrantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [filtroPatrulla, setFiltroPatrulla] = useState(miPatrulla || "Todas");
  const [buscar, setBuscar] = useState("");
  const [verInactivos, setVerInactivos] = useState(false);
  const [formulario, setFormulario] = useState(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setCargando(true);
      setError("");
      const resultado = await obtenerIntegrantes();
      if (cancelado) return;
      if (resultado.ok) setIntegrantes(resultado.integrantes);
      else setError(resultado.error);
      setCargando(false);
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [recarga]);

  async function cambiarEstado(integrante, activo) {
    const resultado = await modificarIntegrante({ ...integrante, activo });
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setRecarga((n) => n + 1);
  }

  if (formulario) {
    return (
      <FormularioIntegrante
        key={formulario.codigo ?? "nuevo"}
        inicial={formulario.datos}
        patrullaInicial={filtroPatrulla !== "Todas" ? filtroPatrulla : patrullas[0].nombre}
        onCancelar={() => setFormulario(null)}
        onGuardado={() => {
          setFormulario(null);
          setRecarga((n) => n + 1);
        }}
      />
    );
  }

  const activos = integrantes.filter((i) => i.activo);
  const faltantes = patrullas
    .map((p) => ({
      patrulla: p.nombre,
      faltan: ["Guía", "Subguía"].filter(
        (r) => !activos.some((i) => i.patrulla === p.nombre && i.rol === r)
      ),
    }))
    .filter((f) => f.faltan.length > 0);

  const textoBuscado = buscar.trim().toLowerCase();
  const visibles = integrantes
    .filter((i) => verInactivos || i.activo)
    .filter((i) => filtroPatrulla === "Todas" || i.patrulla === filtroPatrulla)
    .filter(
      (i) =>
        !textoBuscado ||
        `${i.nombres} ${i.apellidos} ${i.codigo}`.toLowerCase().includes(textoBuscado)
    );

  function prioridad(rol) {
    return rol ? roles.indexOf(rol) : 99;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow">
        <label className="min-w-36 flex-1">
          <span className="mb-1 block text-sm font-bold">Patrulla</span>
          <select value={filtroPatrulla} onChange={(e) => setFiltroPatrulla(e.target.value)} className={campo}>
            <option value="Todas">Todas</option>
            {patrullas.map((p) => (
              <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
            ))}
          </select>
        </label>
        <label className="min-w-40 flex-[2]">
          <span className="mb-1 block text-sm font-bold">Buscar</span>
          <input
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Nombre, apellido o código"
            className={campo}
          />
        </label>
        <label className="flex items-center gap-2 pb-2">
          <input
            type="checkbox"
            checked={verInactivos}
            onChange={(e) => setVerInactivos(e.target.checked)}
            className="h-5 w-5"
          />
          <span className="text-sm font-bold">Ver inactivos</span>
        </label>
        <button
          type="button"
          onClick={() => setFormulario({ datos: null })}
          className="rounded-full bg-verde px-5 py-2 font-bold text-white hover:bg-verde-oscuro"
        >
          ＋ Agregar
        </button>
      </div>

      {faltantes.length > 0 && !cargando && (
        <div className="rounded-xl bg-yellow-100 p-4 text-sm text-yellow-900">
          {faltantes.map((f) => (
            <p key={f.patrulla}>
              ⚠️ <b>{f.patrulla}</b>: falta asignar {f.faltan.join(" y ")}.
            </p>
          ))}
        </div>
      )}

      {error && <p className="rounded-lg bg-red-100 p-4 text-red-800">{error}</p>}
      {cargando && <p className="py-6 text-center">Cargando...</p>}

      {!cargando && !error && (
        <p className="text-sm text-gray-600">
          {visibles.length} integrante(s) · {activos.length} activos en total
        </p>
      )}

      {patrullas
        .filter((p) => filtroPatrulla === "Todas" || p.nombre === filtroPatrulla)
        .map((p) => {
          const deLaPatrulla = visibles
            .filter((i) => i.patrulla === p.nombre)
            .sort(
              (a, b) =>
                prioridad(a.rol) - prioridad(b.rol) || a.apellidos.localeCompare(b.apellidos)
            );
          if (deLaPatrulla.length === 0) return null;

          return (
            <div key={p.nombre} className="rounded-xl bg-white p-4 shadow">
              <h3 className="mb-3 text-lg font-bold text-verde">{p.nombre}</h3>
              <ul className="divide-y">
                {deLaPatrulla.map((i) => (
                  <li key={i.codigo} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <div>
                      <p className={`font-bold ${i.activo ? "" : "text-gray-400 line-through"}`}>
                        {i.nombres} {i.apellidos}
                      </p>
                      <p className="text-xs text-gray-500">
                        Código {i.codigo}
                        {i.rol ? ` · ${i.rol}` : " · Sin rol"}
                        {!i.activo && " · Inactivo"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormulario({ codigo: i.codigo, datos: i })}
                        className="rounded-full border-2 border-verde px-3 py-1 text-sm font-bold text-verde"
                      >
                        ✏️ Editar
                      </button>
                      {i.activo ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`¿Dar de baja a ${i.nombres} ${i.apellidos}?`)) cambiarEstado(i, false);
                          }}
                          className="rounded-full border-2 border-red-600 px-3 py-1 text-sm font-bold text-red-600"
                        >
                          Dar de baja
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => cambiarEstado(i, true)}
                          className="rounded-full border-2 border-gray-500 px-3 py-1 text-sm font-bold text-gray-600"
                        >
                          Reactivar
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
    </div>
  );
}