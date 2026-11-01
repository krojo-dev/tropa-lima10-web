import EncabezadoPagina from "@/components/EncabezadoPagina";

export default function Contacto() {
  return (
    <>
      <EncabezadoPagina titulo="Contacto" subtitulo="¿Quieres unirte? Escríbenos" />
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="mb-6 text-lg">
          ¿Quieres que tu hijo o hija sea parte de la tropa? Escríbenos y te contamos todo.
        </p>
        <a
          href="https://wa.me/51975196222"
          className="inline-block rounded-full bg-green-500 px-8 py-3 font-bold text-white hover:bg-green-400"
        >
          Escribir por WhatsApp
        </a>
        <p className="mt-6 text-sm">Síguenos en redes: gruposcout lima 10</p>
      </section>
    </>
  );
}