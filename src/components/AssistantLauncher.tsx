"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import ChatPanel from "./ChatPanel";

export default function AssistantLauncher() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  if (path.startsWith("/assistant")) return null;
  return (
    <>
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 h-[85vh] overflow-hidden rounded-t-3xl shadow-2xl ring-1 ring-line sm:inset-x-auto sm:right-5 sm:bottom-24 sm:h-[600px] sm:max-h-[calc(100vh-8rem)] sm:w-[400px] sm:rounded-3xl">
          <ChatPanel onClose={() => setOpen(false)} />
        </div>
      )}
      <button onClick={() => setOpen(!open)} aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        className={`fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 px-5 py-3.5 font-semibold text-white shadow-xl shadow-fuchsia-500/30 transition hover:scale-105 ${open ? "max-sm:hidden" : ""}`}>
        <span className="text-xl">{open ? "✕" : "🤖"}</span><span className="hidden sm:inline">{open ? "Close" : "Ask FAHR Guide"}</span>
      </button>
    </>
  );
}
