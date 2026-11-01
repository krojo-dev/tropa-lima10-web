import { Suspense } from "react";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import { auth, signIn, signOut, esDirigente } from "@/auth";

export const metadata = {
  title: "Panel de dirigentes | Tropa Trinitarios",
  robots: { index: false },
};

async function ContenidoPanel() {
  const sesion = await auth();
  const autorizado = sesion && esDirigente(sesion.user?.email);

  if (!autorizado) {
    return (
      <section className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="mb-6">Inicia sesión con tu cuenta de Google autorizada.</p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/puntajes/admin" });
          }}
        >
          <button
            type="submit"
            className="rounded-full bg-verde px-8 py-3 font-bold text-white hover:bg-verde-oscuro"
          >
            Iniciar sesión con Google
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="mb-2 text-lg font-bold">Hola, {sesion.user.name}</p>
      <p className="mb-6">✅ Sesión iniciada. Aquí irá el formulario para registrar puntajes.</p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/puntajes" });
        }}
      >
        <button type="submit" className="rounded-full border-2 border-verde px-6 py-2 font-bold text-verde">
          Cerrar sesión
        </button>
      </form>
    </section>
  );
}

export default function PanelDirigentes() {
  return (
    <>
      <EncabezadoPagina titulo="Panel de dirigentes" subtitulo="Acceso solo para dirigentes" />
      <Suspense fallback={<p className="px-4 py-16 text-center">Cargando...</p>}>
        <ContenidoPanel />
      </Suspense>
    </>
  );
}