import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black py-4 text-center text-sm text-gray-400">
      <p>© 2026 Tropa Trinitarios · Grupo Scout Lima 10</p>
      <Link href="/puntajes/admin" className="text-xs hover:text-white">
        Acceso dirigentes
      </Link>
    </footer>
  );
}