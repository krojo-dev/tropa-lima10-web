import EncabezadoPagina from "@/components/EncabezadoPagina";

export default function Galeria() {
  return (
    <>
      <EncabezadoPagina titulo="Galería" subtitulo="Momentos de nuestras aventuras" />
      <section className="mx-auto max-w-6xl px-4 py-16">
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
    </>
  );
}