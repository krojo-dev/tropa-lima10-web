export default function EncabezadoPagina({ titulo, subtitulo }) {
  return (
    <section className="bg-verde px-4 py-12 text-center text-white">
      <h1 className="text-3xl font-extrabold md:text-5xl">{titulo}</h1>
      {subtitulo && <p className="mx-auto mt-3 max-w-xl text-lg">{subtitulo}</p>}
    </section>
  );
}