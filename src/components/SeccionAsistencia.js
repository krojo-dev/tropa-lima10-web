"use client";
import { useEffect, useState } from "react";
import { obtenerIntegrantes } from "@/app/puntajes/admin/acciones-integrantes";
import {
  obtenerAsistenciaDelDia,
  guardarAsistencia,
} from "@/app/puntajes/admin/acciones-asistencia";
import { patrullas, roles, estadosAsistencia } from "@/data/datos";

const campo = "w-full rounded-lg border border-gray-300 px-3 py-2";

const estilos = {
  "Asistió": { icono: "✅", activo: "border-green-600 bg-green-600 text-white" },
  "Tardanza": { icono: "⏰", activo: "border-yellow-500 bg-yellow-500 text-black" },
  "Falta": { icono: "❌", activo: "border-red-600 bg-red-600 text-white" },
  "Falta justificada": { icono: "📄", activo: "border-blue-600 bg-blue-600 text-white" },
};

function hoyEnLima() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });
}

function etiquetaCorta(estado) {
  return estado === "Falta justificada" ? "Justificada" : estado;
}

function prioridad(rol) {
  return rol ? roles.indexOf(rol) : 99;
}

export default function SeccionAsistencia({ miPatrulla = "" }) {
  const [fecha, setFecha] = useState(hoyEnLima());
  const [filtroPatrulla, setFiltroPatrulla] = useState(miPatrulla || "Todas");
  const [integrantes, setIntegrantes] = useState([]);
  const [guardadas, setGuardadas] = useState({});
  const [cambios, setCambios] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setCargando(true);
      setError("");
      const [personas, asistencia] = await Promise.all([
        obtenerIntegrantes(),
        obtenerAsistenciaDelDia(fecha),
      ]);
      if (cancelado) return;
      if (!personas.ok) setError(personas.error);
      else if (!asistencia.ok) setError(asistencia.error);
      else {
        setIntegrantes(personas.integrantes.filter((i) => i.activo));
        setGuardadas(asistencia.marcas);
      }
      setCargando(false);
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [fecha, recarga]);

  const totalCambios = Object.keys(cambios).length;

  function estadoDe(codigo) {
    return cambios[codigo] ?? guardadas[codigo] ?? "";
  }

  function cambiarFecha(nueva) {
    if (!nueva || nueva === fecha) return;
    if (totalCambios > 0 && !confirm("Tienes cambios sin guardar. ¿Descartarlos?")) return;
    setCambios({});
    setMensaje("");
    setFecha(nueva);
  }

  function marcar(codigo, estado) {
    setMensaje("");
    setCambios((anterior) => {
      const siguiente = { ...anterior };
      if (guardadas[codigo] === estado) delete siguiente[codigo];
      else siguiente[codigo] = estado;
      return siguiente;
    });
  }

  function marcarPendientes(lista) {
    setMensaje("");
    setCambios((anterior) => {
      const siguiente = { ...anterior };
      lista.forEach((i) => {
        if (!(siguiente[i.codigo] ?? guardadas[i.codigo])) siguiente[i.codigo] = "Asistió";
      });
      return siguiente;
    });
  }

  async function guardar() {
    const marcas = Object.entries(cambios).map(([codigo, estado]) => ({ codigo, estado }));
    if (marcas.length === 0) return;

    setGuardando(true);
    setError("");
    setMensaje("");
    const resultado = await guardarAsistencia({ fecha, marcas });
    setGuardando(false);

    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setCambios({});
    setMensaje(
      `✅ Asistencia guardada: ${resultado.nuevas} nuevas, ${resultado.actualizadas} actualizadas.`
    );
    setRecarga((n) => n + 1);
  }

  const visibles = integrantes.filter(
    (i) => filtroPatrulla === "Todas" || i.patrulla === filtroPatrulla
  );

  const conteo = { "Asistió": 0, "Tardanza": 0, "Falta": 0, "Falta justificada": 0, pendientes: 0 };
  visibles.forEach((i) => {
    const estado = estadoDe(i.codigo);
    if (estado) conteo[estado]++;
    else conteo.pendientes++;
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl bg-white p-4 shadow sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-bold">📅 Fecha de la reunión</span>
          <input
            type="date"
            value={fecha}
            onChange={(e) => cambiarFecha(e.target.value)}
            className={campo}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">Patrulla</span>
          <select
            value={filtroPatrulla}
            onChange={(e) => setFiltroPatrulla(e.target.value)}
            className={campo}
          >
            <option value="Todas">Todas</option>
            {patrullas.map((p) => (
              <option key={p.nombre} value={p.nombre}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!cargando && !error && (
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">
            ✅ {conteo["Asistió"]} asistieron
          </span>
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-900">
            ⏰ {conteo["Tardanza"]} tardanzas
          </span>
          <span className="rounded-full bg-red-100 px-3 py-1 text-red-800">
            ❌ {conteo["Falta"]} faltas
          </span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">
            📄 {conteo["Falta justificada"]} justificadas
          </span>
          <span className="rounded-full bg-gray-200 px-3 py-1 text-gray-700">
            ⏳ {conteo.pendientes} pendientes
          </span>
        </div>
      )}

      {error && <p className="rounded-lg bg-red-100 p-4 text-red-800">{error}</p>}
      {mensaje && <p className="rounded-lg bg-green-100 p-4 text-green-800">{mensaje}</p>}
      {cargando && <p className="py-6 text-center">Cargando...</p>}

      {!cargando && !error && visibles.length === 0 && (
        <p className="py-6 text-center text-gray-600">No hay integrantes activos para mostrar.</p>
      )}

      {!cargando &&
        patrullas
          .filter((p) => filtroPatrulla === "Todas" || p.nombre === filtroPatrulla)
          .map((p) => {
            const lista = visibles
              .filter((i) => i.patrulla === p.nombre)
              .sort(
                (a, b) =>
                  prioridad(a.rol) - prioridad(b.rol) || a.apellidos.localeCompare(b.apellidos)
              );
            if (lista.length === 0) return null;

            const marcados = lista.filter((i) => estadoDe(i.codigo)).length;

            return (
              <div key={p.nombre} className="rounded-xl bg-white p-4 shadow">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-verde">
                    {p.nombre}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      · {marcados}/{lista.length} marcados
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => marcarPendientes(lista)}
                    className="rounded-full border-2 border-verde px-3 py-1 text-xs font-bold text-verde"
                  >
                    ✔ Pendientes: asistieron
                  </button>
                </div>

                <ul className="divide-y">
                  {lista.map((i) => {
                    const actual = estadoDe(i.codigo);
                    const sinGuardar = i.codigo in cambios;
                    return (
                      <li key={i.codigo} className="py-3">
                        <p className="font-bold">
                          {i.nombres} {i.apellidos}
                          {sinGuardar && <span className="ml-2 text-orange-500">●</span>}
                        </p>
                        <p className="mb-2 text-xs text-gray-500">{i.rol || "Sin rol"}</p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {estadosAsistencia.map((estado) => (
                            <button
                              key={estado}
                              type="button"
                              onClick={() => marcar(i.codigo, estado)}
                              className={`rounded-lg border-2 px-2 py-2 text-xs font-bold ${
                                actual === estado
                                  ? estilos[estado].activo
                                  : "border-gray-300 text-gray-600"
                              }`}
                            >
                              {estilos[estado].icono} {etiquetaCorta(estado)}
                            </button>
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

      <div className="sticky bottom-3 z-10">
        <button
          type="button"
          onClick={guardar}
          disabled={guardando || totalCambios === 0}
          className="w-full rounded-full bg-verde py-3 text-lg font-bold text-white shadow-lg hover:bg-verde-oscuro disabled:bg-gray-400"
        >
          {guardando
            ? "Guardando..."
            : totalCambios === 0
              ? "Sin cambios por guardar"
              : `Guardar asistencia (${totalCambios})`}
        </button>
      </div>
    </div>
  );
}