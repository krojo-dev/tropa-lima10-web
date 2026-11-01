import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export function esDirigente(correo) {
  const permitidos = (process.env.LEADER_EMAILS ?? "")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);
  return permitidos.includes((correo ?? "").toLowerCase());
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    signIn({ profile }) {
      return Boolean(profile?.email_verified) && esDirigente(profile?.email);
    },
  },
});