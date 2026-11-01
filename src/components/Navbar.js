"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", texto: "Inicio" },
  { href: "/nosotros", texto: "Nosotros" },
  { href: "/actividades", texto: "Actividades" },
  { href: "/puntajes", texto: "Puntajes" },
  { href: "/biblioteca", texto: "Biblioteca" },
  { href: "/galeria", texto: "Galería" },
  { href: "/contacto", texto: "Contacto" },
];

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const rutaActual = usePathname();

  function claseEnlace(href) {
    return href === rutaActual ? "font-bold text-yellow-300" : "hover:text-yellow-300";
  }

  return (
    <header className="sticky top-0 z-50 bg-verde-oscuro text-white shadow">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <img src="/logo.png" alt="Logo Grupo Scout Lima 10" className="h-10 w-10 object-contain" />
          Tropa Trinitarios
        </Link>

        <button
          className="text-2xl lg:hidden"
          onClick={() => setAbierto(!abierto)}
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <ul className="hidden gap-6 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={claseEnlace(l.href)}>{l.texto}</Link>
            </li>
          ))}
        </ul>
      </nav>

      {abierto && (
        <ul className="flex flex-col gap-3 px-4 pb-4 lg:hidden">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setAbierto(false)} className={claseEnlace(l.href)}>
                {l.texto}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}