import Link from "next/link";
import { notFound } from "next/navigation";
import ActualizarAuto from "@/components/ActualizarAuto";
import { TarjetaResumen, FilaCategoria, GraficoSemanal, TablaPuntajes } from "@/components/dashboard";
import { patrullas, fondoPatrulla } from "@/data/datos";
import {
  categorias,
  obtenerFilas,
  calcularRanking,
  inicioSemana,
  etiquetaSemana,
  etiquetaMes,
  slug,
  puntosPorCategoria,
  posicion,
  puntosDe,
  evolucionSemanal,
} from "@/lib/puntajes";
import { Suspense } from "react";


export function generateStaticParams() {
  return patrullas.map((p) => ({ patrulla: slug(p.nombre) }));
}

export const metadata = {
  title: "Patrulla | Tropa Trinitarios",
};

function calcularTablero(filas, nombre, nombres) {
  const ultimaFecha = filas.map((f) => f.fecha).sort().at(-1);
  const semana = inicioSemana(ultimaFecha);
  const mes = ultimaFecha.slice(0, 7);
  const anio = ultimaFecha.slice(0, 4);

  const filasAnio = filas.filter((f) => f.fecha.startsWith(anio));
  const rankSemana = calcularRanking(filas.filter((f) => inicioSemana(f.fecha) === semana), nombres);
  const rankMes = calcularRanking(filas.filter((f) => f.fecha.startsWith(mes)), nombres);
  const rankAnio = calcularRanking(filasAnio, nombres);

  const porCategoria = puntosPorCategoria(filasAnio, nombre);
  const base = Object.values(porCategoria).reduce((suma, v) => suma + Math.max(v, 0), 0);

  const categoriasInfo = categorias.map((c) => ({
    categoria: c,
    puntos: porCategoria[c],
    porcentaje: base > 0 ? Math.round((Math.max(porCategoria[c], 0) / base) * 100) : 0,
    lugar: posicion(calcularRanking(filasAnio.filter((f) => f.categoria === c), nombres), nombre),
  }));

  const semanas = evolucionSemanal(filas, nombre, nombres, 8).map((s) => ({
    ...s,
    etiqueta: etiquetaSemana(s.semana).split(" al ")[0],
  }));

  const propios = filasAnio
    .filter((f) => f.patrulla === nombre)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  return {
    anio,
    resumen: [
      {
        titulo: "Semana",
        subtitulo: etiquetaSemana(semana),
        puntos: puntosDe(rankSemana, nombre),
        lugar: posicion(rankSemana, nombre),
      },
      {
        titulo: "Mes",
        subtitulo: etiquetaMes(mes),
        puntos: puntosDe(rankMes, nombre),
        lugar: posicion(rankMes, nombre),
      },
      {
        titulo: "Año",
        subtitulo: anio,
        puntos: puntosDe(rankAnio, nombre),
        lugar: posicion(rankAnio, nombre),
      },
    ],
    categoriasInfo,
    semanas,
    juegos: propios.filter((f) => f.categoria === "Juegos").slice(0, 20),
    otros: propios.filter((f) => f.categoria !== "Juegos").slice(0, 20),
  };
}

async function ContenidoPatrulla({ params }) {
  const { patrulla: parametro } = await params;
  const patrulla = patrullas.find((p) => slug(p.nombre) === parametro);
  if (!patrulla) notFound();

  const filas = await obtenerFilas();
  const nombres = patrullas.map((p) => p.nombre);
  const color = patrulla.colores[0];
  const tablero = filas.length > 0 ? calcularTablero(filas, patrulla.nombre, nombres) : null;

  return (
    <>
      <ActualizarAuto segundos={20} />

      {/* PERFIL */}
      <section className="pb-4">
        <div className="h-28" style={{ background: fondoPatrulla(patrulla.colores) }} />
        <div className="mx-auto -mt-12 max-w-3xl px-4">
          <div className="rounded-2xl bg-white p-6 pt-0 text-center shadow-lg">
            <div className="mx-auto -mt-14 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 text-5xl font-extrabold shadow">
              {patrulla.logo ? (
                <img
                  src={patrulla.logo}
                  alt={`Escudo de la patrulla ${patrulla.nombre}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span style={{ color }}>{patrulla.nombre[0]}</span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">{patrulla.nombre}</h1>
            <p className="mt-2 italic text-gray-700">«{patrulla.lema}»</p>
            <p className="mt-3 text-sm font-bold">📣 Nuestro grito</p>
            <p className="text-gray-700">{patrulla.grito}</p>
          </div>
        </div>
      </section>

      {/* DASHBOARD */}
      <section className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <Link href="/puntajes" className="inline-block text-sm font-bold text-verde hover:underline">
          ← Volver al ranking
        </Link>

        {!tablero ? (
          <p className="rounded-xl bg-white p-8 text-center shadow">
            Aún no hay puntajes registrados.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              {tablero.resumen.map((r) => (
                <TarjetaResumen key={r.titulo} {...r} />
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-xl bg-white p-6 shadow">
                <h2 className="text-xl font-bold text-verde">Puntaje por categoría · {tablero.anio}</h2>
                {tablero.categoriasInfo.map((c) => (
                  <FilaCategoria key={c.categoria} {...c} color={color} />
                ))}
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-bold text-verde">Evolución semanal</h2>
                <GraficoSemanal semanas={tablero.semanas} color={color} />
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="text-xl font-bold text-verde">✅ Asistencia</h2>
              <p className="mt-2 text-sm text-gray-600">
                Próximamente: aquí verás el porcentaje de asistencia de la patrulla a las reuniones.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="mb-2 text-xl font-bold text-verde">🎮 Puntaje por juego</h2>
              <TablaPuntajes filas={tablero.juegos} textoVacio="Aún no hay juegos registrados." />
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="mb-2 text-xl font-bold text-verde">📋 Otras categorías</h2>
              <TablaPuntajes
                filas={tablero.otros}
                mostrarCategoria
                textoVacio="Aún no hay otros registros."
              />
            </div>
          </>
        )}
      </section>
    </>
  );
}

export default function PaginaPatrulla({ params }) {
  return (
    <Suspense fallback={<p className="px-4 py-24 text-center">Cargando patrulla...</p>}>
      <ContenidoPatrulla params={params} />
    </Suspense>
  );
}