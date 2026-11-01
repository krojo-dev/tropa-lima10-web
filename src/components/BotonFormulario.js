export default function BotonFormulario({ enlace, texto }) {
  if (!enlace) {
    return (
      <span className="mt-4 inline-block rounded-full bg-gray-300 px-5 py-2 text-sm font-bold text-gray-600">
        Próximamente
      </span>
    );
  }
  return (
    <a
      href={enlace}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-block rounded-full bg-verde px-5 py-2 text-sm font-bold text-white hover:bg-verde-oscuro"
    >
      {texto}
    </a>
  );
}