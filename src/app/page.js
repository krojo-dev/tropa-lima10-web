import Navbar from "@/components/Navbar";

const queHacemos = [
  { icono: "⛺", titulo: "Campamentos", texto: "Pernoctadas y salidas al aire libre para vivir la naturaleza." },
  { icono: "🤝", titulo: "Servicio", texto: "Aprendemos ayudando a nuestra comunidad." },
  { icono: "🧭", titulo: "Habilidades", texto: "Orientación, nudos, primeros auxilios y mucho más." },
  { icono: "⭐", titulo: "Liderazgo", texto: "Cada joven crece asumiendo responsabilidades." },
];

const patrullas = [
  { nombre: "Águilas", colores: ["#1b5e20", "#111111"] },
  { nombre: "Lobos", colores: ["#facc15", "#111111"] },
  { nombre: "Panteras", colores: ["#facc15"] },
  { nombre: "Rinocerontes", colores: ["#14213d", "#f97316"] },
];

const actividades = [
  { titulo: "Visita al cementerio", fecha: "Fecha por confirmar", lugar: "Por confirmar" },
  { titulo: "Pernocta en Lunahuaná", fecha: "Fecha por confirmar", lugar: "Lunahuaná" },
];

function fondoPatrulla(colores) {
  if (colores.length === 1) return colores[0];
  return `linear-gradient(135deg, ${colores[0]} 50%, ${colores[1]} 50%)`;
}

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        {/* PORTADA */}
        <section id="inicio" className="bg-verde px-4 py-24 text-center text-white">
          <h1 className="text-4xl font-extrabold md:text-6xl">Siempre Listos</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg">
            Tropa Trinitarios · Grupo Scout Lima 10
          </p>
          <a
            href="#contacto"
            className="mt-8 inline-block rounded-full bg-yellow-400 px-8 py-3 font-bold text-black hover:bg-yellow-300"
          >
            ¡Únete a la aventura!
          </a>
        </section>

        {/* QUIÉNES SOMOS */}
        <section id="quienes-somos" className="mx-auto max-w-4xl px-4 py-16">
          <h2 className="mb-4 text-3xl font-bold text-verde">Quiénes somos</h2>
          <p className="text-lg leading-relaxed">
            Somos la rama scout para jóvenes de 11 a 14 años. Nos reunimos todos los sábados
            de 4:30 a 6:30 pm en el Parque Diego Morcillo. Realizamos actividades educativas
            no formales donde cada joven aprende jugando mediante el método scout.
          </p>
        </section>

        {/* QUÉ HACEMOS */}
        <section id="que-hacemos" className="bg-white px-4 py-16">
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

        {/* PATRULLAS */}
        <section id="patrullas" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-verde">Nuestras patrullas</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {patrullas.map((p) => (
              <div key={p.nombre} className="overflow-hidden rounded-xl bg-white shadow">
                <div className="h-28" style={{ background: fondoPatrulla(p.colores) }} />
                <h3 className="p-4 text-center text-xl font-bold">{p.nombre}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* ACTIVIDADES */}
        <section id="actividades" className="bg-white px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-verde">Próximas actividades</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {actividades.map((a) => (
                <div key={a.titulo} className="rounded-xl border-l-8 border-verde bg-crema p-6 shadow">
                  <h3 className="text-xl font-bold">{a.titulo}</h3>
                  <p className="mt-2 text-sm">📅 {a.fecha}</p>
                  <p className="text-sm">📍 {a.lugar}</p>
                  <a
                    href="#"
                    className="mt-4 inline-block rounded-full bg-verde px-5 py-2 text-sm font-bold text-white hover:bg-verde-oscuro"
                  >
                    Inscribirme
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GALERÍA */}
        <section id="galeria" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-verde">Galería</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="flex h-40 items-center justify-center rounded-xl bg-gray-200 text-gray-500"
              >
                Foto {n}
              </div>
            ))}
          </div>
        </section>

        {/* CONTACTO */}
        <section id="contacto" className="bg-verde-oscuro px-4 py-16 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">Contacto</h2>
          <p className="mb-6">¿Quieres que tu hijo o hija sea parte de la tropa? Escríbenos.</p>
          <a
            href="https://wa.me/51975196222"
            className="inline-block rounded-full bg-green-500 px-8 py-3 font-bold hover:bg-green-400"
          >
            Escribir por WhatsApp
          </a>
          <p className="mt-6 text-sm">Síguenos en redes: gruposcout lima 10</p>
        </section>
      </main>

      <footer className="bg-black py-4 text-center text-sm text-gray-400">
        © 2026 Tropa Trinitarios · Grupo Scout Lima 10
      </footer>
    </>
  );
}