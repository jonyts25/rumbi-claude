"use client";

import { useEffect, useState } from "react";

interface ConnectInfo {
  url: string;
  qr: string;
  isLocal: boolean;
}

export function ConnectCard() {
  const [info, setInfo] = useState<ConnectInfo | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/connect")
      .then((r) => r.json())
      .then((data: ConnectInfo) => {
        if (active) setInfo(data);
      })
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  const copy = async () => {
    if (!info) return;
    try {
      await navigator.clipboard.writeText(info.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sin clipboard: el usuario puede copiar manualmente */
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-ink-line bg-ink-soft p-6 sm:flex-row sm:items-center">
      <div className="shrink-0 rounded-xl bg-white p-2">
        {info ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={info.qr}
            alt="Código QR para abrir Rumbi en el celular"
            width={130}
            height={130}
            className="h-[130px] w-[130px]"
          />
        ) : (
          <div className="grid h-[130px] w-[130px] place-items-center text-xs text-gray-400">
            {error ? "QR no disponible" : "Generando…"}
          </div>
        )}
      </div>

      <div className="text-center sm:text-left">
        <h3 className="text-lg font-semibold text-white">
          📱 Ábrelo en tu celular
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          {info?.isLocal === false
            ? "Escanea el QR para abrir Rumbi en tu teléfono."
            : "Escanea el QR con tu cel (conectado al mismo WiFi) y prueba Rumbi como se vivirá en móvil."}
        </p>

        {info && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <code className="rounded-lg border border-ink-line bg-ink px-3 py-1.5 text-xs text-brand">
              {info.url}
            </code>
            <button
              onClick={copy}
              className="rounded-lg border border-ink-line px-3 py-1.5 text-xs text-gray-300 transition hover:border-brand/60 hover:text-white"
            >
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
