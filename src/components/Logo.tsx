import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
    >
      <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-brand text-ink shadow-[0_0_24px_rgba(0,216,160,0.45)]">
        <span className="text-base font-black">R</span>
      </span>
      <span>
        Rumbi
        <span className="ml-1 align-top text-[10px] font-medium text-brand">
          2.0
        </span>
      </span>
    </Link>
  );
}
