import Link from "next/link";
import { patrullas, fondoPatrulla } from "@/data/datos";
import { slug } from "@/lib/puntajes";

const posiciones = ["🥇", "🥈", "🥉"];

export default function TablaRanking({ titulo, subtitulo, ranking }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="text-2xl font-bold text-verde">{titulo}</h2>
      <p className="mb-4 text-sm capitalize text-gray-600">{subtitulo}</p>
      <ul className="space-y-3">
        {ranking.map((r, i) => {
          const colores = patrullas.find((p) => p.nombre === r.patrulla)?.colores ?? ["#999999"];
          return (
            <li key={r.patrulla}>
              <Link
                href={`/puntajes/${slug(r.patrulla)}`}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-crema"
              >
                <span className="w-8 text-xl">{posiciones[i] ?? `${i + 1}º`}</span>
                <span
                  className="h-8 w-8 shrink-0 rounded-full"
                  style={{ background: fondoPatrulla(colores) }}
                />
                <span className="flex-1 font-bold">{r.patrulla}</span>
                <span className="text-xl font-extrabold">{r.puntos} pts</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}