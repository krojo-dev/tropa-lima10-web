import EncabezadoPagina from "@/components/EncabezadoPagina";
import { albumes, facebookGrupo } from "@/data/datos";

export default function Galeria() {
  return (
    <>
      <EncabezadoPagina titulo="Galería" subtitulo="Momentos de nuestras aventuras" />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albumes.map((a) => (
            <div key={a.titulo} className="overflow-hidden rounded-xl bg-white shadow">
              <div className="flex h-48 items-center justify-center bg-gray-200 text-5xl">
                {a.portada ? (
                  <img
                    src={a.portada}
                    alt={`Portada del álbum ${a.titulo}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>📷</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold">{a.titulo}</h3>
                <p className="mt-1 text-sm text-gray-600">{a.descripcion}</p>
                {a.enlace ? (
                  <a
                    href={a.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block rounded-full bg-verde px-5 py-2 text-sm font-bold text-white hover:bg-verde-oscuro"
                  >
                    Ver álbum en Facebook ↗
                  </a>
                ) : (
                  <span className="mt-4 inline-block rounded-full bg-gray-300 px-5 py-2 text-sm font-bold text-gray-600">
                    Próximamente
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {facebookGrupo && (
          <div className="mt-10 text-center">
            <a
              href={facebookGrupo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full border-2 border-verde px-6 py-3 font-bold text-verde hover:bg-verde hover:text-white"
            >
              Ver más en nuestra página de Facebook ↗
            </a>
          </div>
        )}
      </section>
    </>
  );
}