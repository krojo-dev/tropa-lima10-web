const medallas = ["🥇", "🥈", "🥉"];

function fechaCorta(fecha) {
  const [, mes, dia] = fecha.split("-");
  return `${dia}/${mes}`;
}

function formatoPuntos(n) {
  return n > 0 ? `+${n}` : String(n);
}

export function TarjetaResumen({ titulo, subtitulo, puntos, lugar }) {
  return (
    <div className="rounded-xl bg-white p-5 text-center shadow">
      <p className="text-sm font-bold uppercase text-gray-500">{titulo}</p>
      <p className="text-xs capitalize text-gray-500">{subtitulo}</p>
      <p className="my-2 text-4xl font-extrabold text-verde">{puntos}</p>
      <p className="font-bold">
        {medallas[lugar - 1] ?? "🏅"} {lugar}º lugar
      </p>
    </div>
  );
}

export function FilaCategoria({ categoria, puntos, porcentaje, lugar, color }) {
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-x-3 text-sm">
        <span className="font-bold">{categoria}</span>
        <span className="text-gray-600">
          {puntos} pts · {porcentaje}% · {lugar}º entre patrullas
        </span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full rounded-full" style={{ width: `${porcentaje}%`, background: color }} />
      </div>
    </div>
  );
}

export function GraficoSemanal({ semanas, color }) {
  const maximo = Math.max(...semanas.map((s) => s.puntos), 1);

  return (
    <div className="flex h-48 items-end gap-2">
      {semanas.map((s) => {
        const altura = s.puntos > 0 ? Math.max((s.puntos / maximo) * 100, 6) : 4;
        return (
          <div key={s.semana} className="flex h-full flex-1 flex-col items-center justify-end">
            <span className="text-xs font-bold">
              {s.gano && "🥇 "}
              {s.puntos}
            </span>
            <div
              className="w-full rounded-t-md"
              style={{ height: `${altura}%`, background: s.puntos < 0 ? "#dc2626" : color }}
            />
            <span className="mt-1 text-[10px] text-gray-500">{s.etiqueta}</span>
          </div>
        );
      })}
    </div>
  );
}

export function TablaPuntajes({ filas, mostrarCategoria = false, textoVacio }) {
  if (filas.length === 0) {
    return <p className="py-4 text-center text-sm text-gray-500">{textoVacio}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="py-2 pr-3">Fecha</th>
            {mostrarCategoria && <th className="py-2 pr-3">Categoría</th>}
            <th className="py-2 pr-3">Detalle</th>
            <th className="py-2 text-right">Puntos</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-2 pr-3">{fechaCorta(f.fecha)}</td>
              {mostrarCategoria && <td className="py-2 pr-3">{f.categoria}</td>}
              <td className="py-2 pr-3">{f.detalle || "—"}</td>
              <td
                className={`py-2 text-right font-bold ${f.puntos < 0 ? "text-red-600" : "text-green-700"}`}
              >
                {formatoPuntos(f.puntos)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}