import os from "os";
import QRCode from "qrcode";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

/** Devuelve la primera IPv4 privada (LAN) de la máquina, o null. */
function getLanIp(): string | null {
  const nets = os.networkInterfaces();
  const candidates: string[] = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      const isIPv4 = String(net.family) === "IPv4" || String(net.family) === "4";
      if (isIPv4 && !net.internal) candidates.push(net.address);
    }
  }

  // Preferimos rangos típicos de red doméstica.
  return (
    candidates.find((ip) => ip.startsWith("192.168.")) ??
    candidates.find((ip) => ip.startsWith("10.")) ??
    candidates.find((ip) => ip.startsWith("172.")) ??
    candidates[0] ??
    null
  );
}

export async function GET() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const [hostname, port] = host.split(":");

  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

  let url: string;
  if (isLocal) {
    const ip = getLanIp();
    url = ip ? `http://${ip}:${port ?? "3000"}` : `http://${host}`;
  } else {
    // En producción (Vercel) usamos el dominio público real.
    url = `${proto}://${host}`;
  }

  const qr = await QRCode.toDataURL(url, {
    margin: 1,
    width: 260,
    color: { dark: "#0d1117", light: "#ffffff" },
  });

  return Response.json({ url, qr, isLocal });
}
