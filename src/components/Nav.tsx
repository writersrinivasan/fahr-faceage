"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "📚 Learn" },
  { href: "/lab", label: "🧪 Hands-on Lab" },
  { href: "/quiz", label: "🎯 Quiz" },
  { href: "/references", label: "🔗 References" },
];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/75 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 text-white shadow">
            ◉
          </span>
          <span>
            FAHR <span className="text-gradient">FaceAge</span>
          </span>
        </Link>
        <nav className="hidden gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active(l.href) ? "bg-violet-600 text-white shadow" : "text-muted hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          className="rounded-lg border border-line px-3 py-2 text-sm md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-line px-4 py-2 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`rounded-lg px-3 py-2 text-sm ${active(l.href) ? "bg-violet-600 text-white" : ""}`}>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
