import EncabezadoPagina from "@/components/EncabezadoPagina";

export default function Puntajes() {
  return (
    <>
      <EncabezadoPagina titulo="Puntajes" subtitulo="El ranking de las patrullas" />
      <section className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="text-6xl">🏆</div>
        <h2 className="mt-4 text-2xl font-bold text-verde">Próximamente</h2>
        <p className="mt-2">
          Aquí verás los puntos de cada patrulla por semana y por mes, y quién ganó cada semana.
        </p>
      </section>
    </>
  );
}