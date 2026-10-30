import "./globals.css";

export const metadata = {
  title: "Tropa Trinitarios | Grupo Scout Lima 10",
  description: "Siempre Listos. Rama scout de 11 a 14 años en Lima.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}