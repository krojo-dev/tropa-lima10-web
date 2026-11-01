import EncabezadoPagina from "@/components/EncabezadoPagina";
import TablaRanking from "@/components/TablaRanking";
import { patrullas } from "@/data/datos";
import {
  obtenerFilas,
  calcularRanking,
  inicioSemana,
  ganadoresPorSemana,
  etiquetaSemana,
  etiquetaMes,
} from "@/lib/puntajes";
import ActualizarAuto from "@/components/ActualizarAuto";

export default async function Puntajes() {
  const filas = await obtenerFilas();
  const nombres = patrullas.map((p) => p.nombre);

  if (filas.length === 0) {
    return (
      <>
        <EncabezadoPagina titulo="Puntajes" subtitulo="El ranking de las patrullas" />
        <section className="mx-auto max-w-2xl px-4 py-24 text-center">
          <div className="text-6xl">🏆</div>
          <h2 className="mt-4 text-2xl font-bold text-verde">Aún no hay puntajes</h2>
          <p className="mt-2">Cuando los dirigentes registren el primer puntaje, aparecerá aquí.</p>
        </section>
      </>
    );
  }

  const ultimaFecha = filas.map((f) => f.fecha).sort().at(-1);
  const semana = inicioSemana(ultimaFecha);
  const mes = ultimaFecha.slice(0, 7);
  const anio = ultimaFecha.slice(0, 4);

  const rankingSemana = calcularRanking(
    filas.filter((f) => inicioSemana(f.fecha) === semana),
    nombres
  );
  const rankingMes = calcularRanking(
    filas.filter((f) => f.fecha.startsWith(mes)),
    nombres
  );
  const rankingAnio = calcularRanking(
    filas.filter((f) => f.fecha.startsWith(anio)),
    nombres
  );
  const ganadores = ganadoresPorSemana(filas, nombres);

  return (
    <>
      <EncabezadoPagina titulo="Puntajes" subtitulo="Haz clic en una patrulla para ver su detalle" />
      <ActualizarAuto segundos={20} />

      <section className="mx-auto max-w-5xl space-y-6 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <TablaRanking
            titulo="🏆 Ranking de la semana"
            subtitulo={`Semana del ${etiquetaSemana(semana)}`}
            ranking={rankingSemana}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <TablaRanking titulo="Ranking del mes" subtitulo={etiquetaMes(mes)} ranking={rankingMes} />
          <TablaRanking titulo="Ranking del año" subtitulo={anio} ranking={rankingAnio} />
        </div>
      </section>

      <section className="bg-white px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-verde">Ganadores de cada semana</h2>
          <ul className="space-y-2">
            {ganadores.map((g) => (
              <li
                key={g.semana}
                className="flex items-center justify-between rounded-lg bg-crema px-4 py-3"
              >
                <span className="text-sm">Semana del {etiquetaSemana(g.semana)}</span>
                <span className="font-bold">
                  🥇 {g.ganador.patrulla} ({g.ganador.puntos} pts)
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}