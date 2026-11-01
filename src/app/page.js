import Link from "next/link";

const accesos = [
  { icono: "🏕️", titulo: "Conócenos", texto: "Quiénes somos y nuestras patrullas.", href: "/nosotros" },
  { icono: "📅", titulo: "Actividades", texto: "Próximas salidas e inscripciones.", href: "/actividades" },
  { icono: "🏆", titulo: "Puntajes", texto: "El ranking de las patrullas.", href: "/puntajes" },
  { icono: "📚", titulo: "Biblioteca", texto: "Documentos de la tropa en PDF.", href: "/biblioteca" },
];

export default function Inicio() {
  return (
    <>
      <section className="bg-verde px-4 py-24 text-center text-white">
        <h1 className="text-4xl font-extrabold md:text-6xl">Siempre Listos</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg">Tropa Trinitarios · Grupo Scout Lima 10</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/contacto"
            className="rounded-full bg-yellow-400 px-8 py-3 font-bold text-black hover:bg-yellow-300"
          >
            ¡Únete a la aventura!
          </Link>
          <Link
            href="/actividades"
            className="rounded-full border-2 border-white px-8 py-3 font-bold hover:bg-white hover:text-verde"
          >
            Ver actividades
          </Link>
        </div>
      </section>

      <section className="bg-verde-oscuro px-4 py-6 text-center text-white">
        <p>📍 Parque Diego Morcillo · 🕓 Sábados de 4:30 a 6:30 pm · Jóvenes de 11 a 14 años</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold text-verde">Explora</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {accesos.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rounded-xl bg-white p-6 text-center shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-5xl">{a.icono}</div>
              <h3 className="mt-3 text-xl font-bold">{a.titulo}</h3>
              <p className="mt-2 text-sm">{a.texto}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}