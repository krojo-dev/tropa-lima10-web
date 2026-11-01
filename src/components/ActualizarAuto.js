"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ActualizarAuto({ segundos = 20 }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, segundos * 1000);
    return () => clearInterval(id);
  }, [router, segundos]);

  return null;
}