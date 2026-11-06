import Link from "next/link";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import { queHacemos, patrullas, fondoPatrulla } from "@/data/datos";
import { slug } from "@/lib/puntajes";

export default function Nosotros() {
  return (
    <>
      <EncabezadoPagina titulo="Nosotros" subtitulo="Aprender jugando mediante el método scout" />

      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="mb-4 text-3xl font-bold text-verde">Quiénes somos</h2>
        <p className="text-lg leading-relaxed">
          Somos la rama scout para jóvenes de 11 a 14 años. Nos reunimos todos los sábados
          de 4:30 a 6:30 pm en el Parque Diego Morcillo. Realizamos actividades educativas
          no formales donde cada joven aprende jugando mediante el método scout.
        </p>
      </section>

      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-3xl font-bold text-verde">Qué hacemos</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {queHacemos.map((item) => (
              <div key={item.titulo} className="rounded-xl bg-crema p-6 text-center shadow">
                <div className="text-5xl">{item.icono}</div>
                <h3 className="mt-3 text-xl font-bold">{item.titulo}</h3>
                <p className="mt-2 text-sm">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-2 text-center text-3xl font-bold text-verde">Nuestras patrullas</h2>
        <p className="mb-8 text-center text-gray-600">
          Haz clic en una patrulla para ver su perfil, puntajes y asistencia.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {patrullas.map((p) => (
            <Link
              key={p.nombre}
              href={`/puntajes/${slug(p.nombre)}`}
              className="overflow-hidden rounded-xl bg-white shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="h-28" style={{ background: fondoPatrulla(p.colores) }} />
              <h3 className="px-4 pt-4 text-center text-xl font-bold">{p.nombre}</h3>
              <p className="px-4 pb-4 text-center text-sm font-bold text-verde">Ver perfil →</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}