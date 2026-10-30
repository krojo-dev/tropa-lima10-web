"use client";
import { useState } from "react";

const links = [
  { href: "#quienes-somos", texto: "Quiénes somos" },
  { href: "#que-hacemos", texto: "Qué hacemos" },
  { href: "#patrullas", texto: "Patrullas" },
  { href: "#actividades", texto: "Actividades" },
  { href: "#tramites", texto: "Trámites" },
  { href: "#biblioteca", texto: "Biblioteca" },
  { href: "#galeria", texto: "Galería" },
  { href: "#contacto", texto: "Contacto" },
];

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-verde-oscuro text-white shadow">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#inicio" className="flex items-center gap-2 text-lg font-bold">
          <img src="/logo.png" alt="Logo Grupo Scout Lima 10" className="h-10 w-10 object-contain" />
          Tropa Trinitarios
        </a>

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
              <a href={l.href} className="hover:text-yellow-300">{l.texto}</a>
            </li>
          ))}
        </ul>
      </nav>

      {abierto && (
        <ul className="flex flex-col gap-3 px-4 pb-4 lg:hidden">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setAbierto(false)}>{l.texto}</a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}