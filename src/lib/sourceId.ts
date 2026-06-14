const STORAGE_KEY = "rumbi:source-id";

/**
 * Identidad anónima y estable por navegador. Sin login: solo necesitamos
 * distinguir quién comparte para no confundir reportes entre pestañas.
 */
export function getSourceId(): string {
  if (typeof window === "undefined") return "server";

  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `src-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
