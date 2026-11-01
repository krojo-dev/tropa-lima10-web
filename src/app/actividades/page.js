import EncabezadoPagina from "@/components/EncabezadoPagina";
import BotonFormulario from "@/components/BotonFormulario";
import { actividades, tramites } from "@/data/datos";

export default function Actividades() {
  return (
    <>
      <EncabezadoPagina titulo="Actividades" subtitulo="Próximas salidas, inscripciones y trámites" />

      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold text-verde">Próximas actividades</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {actividades.map((a) => (
            <div key={a.titulo} className="rounded-xl border-l-8 border-verde bg-white p-6 shadow">
              <h3 className="text-xl font-bold">{a.titulo}</h3>
              <p className="mt-2 text-sm">📅 {a.fecha}</p>
              <p className="text-sm">📍 {a.lugar}</p>
              <BotonFormulario enlace={a.formulario} texto="Inscribirme" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold text-verde">Inscripciones y trámites</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {tramites.map((t) => (
              <div key={t.titulo} className="rounded-xl bg-crema p-6 text-center shadow">
                <div className="text-5xl">{t.icono}</div>
                <h3 className="mt-3 text-xl font-bold">{t.titulo}</h3>
                <p className="mt-2 text-sm">{t.texto}</p>
                <BotonFormulario enlace={t.enlace} texto="Completar formulario" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}