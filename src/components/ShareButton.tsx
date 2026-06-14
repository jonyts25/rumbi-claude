"use client";

import { useState } from "react";

interface Props {
  /** Texto que acompaña la liga al compartir. */
  message?: string;
  className?: string;
}

const DEFAULT_MESSAGE =
  "Mira tu camión en vivo con Rumbi 🚌 La comunidad te avisa dónde viene y qué tan lleno va:";

export function ShareButton({ message = DEFAULT_MESSAGE, className }: Props) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Rumbi", text: message, url });
        return;
      } catch {
        /* el usuario canceló o no se pudo: caemos al fallback */
      }
    }

    // Fallback: copiar al portapapeles + abrir WhatsApp Web/App.
    try {
      await navigator.clipboard.writeText(`${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sin clipboard, no pasa nada */
    }
    const wa = `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`;
    window.open(wa, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={share}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-full border border-ink-line px-4 py-1.5 text-sm text-gray-300 transition hover:border-brand/60 hover:text-white"
      }
    >
      <span>📤</span>
      {copied ? "¡Liga copiada!" : "Compartir"}
    </button>
  );
}
