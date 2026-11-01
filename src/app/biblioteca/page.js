import EncabezadoPagina from "@/components/EncabezadoPagina";
import { documentos } from "@/data/datos";

export default function Biblioteca() {
  return (
    <>
      <EncabezadoPagina titulo="Biblioteca" subtitulo="Documentos de la tropa" />
      <section className="mx-auto max-w-4xl px-4 py-16">
        <ul className="space-y-4">
          {documentos.map((d) => (
            <li
              key={d.archivo}
              className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow"
            >
              <div>
                <h3 className="font-bold">📄 {d.titulo}</h3>
                <p className="text-sm">{d.descripcion}</p>
              </div>
              <a
                href={d.archivo}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-full bg-verde px-4 py-2 text-sm font-bold text-white hover:bg-verde-oscuro"
              >
                Ver PDF
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}