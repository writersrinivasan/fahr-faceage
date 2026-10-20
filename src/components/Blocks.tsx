import type { Block } from "@/lib/modules";
import { Rich } from "./Rich";

const tones = {
  info: { box: "bg-sky-50 border-sky-200", icon: "ℹ️", title: "text-sky-900" },
  warn: { box: "bg-amber-50 border-amber-300", icon: "⚠️", title: "text-amber-900" },
  tip: { box: "bg-emerald-50 border-emerald-200", icon: "💡", title: "text-emerald-900" },
  key: { box: "bg-violet-50 border-violet-200", icon: "🔑", title: "text-violet-900" },
};
const statColors = ["from-violet-500 to-fuchsia-500", "from-rose-500 to-orange-400", "from-sky-500 to-cyan-400", "from-emerald-500 to-lime-400"];

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-fa">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h":
            return <h2 key={i} className="mt-10 mb-2 font-display text-2xl font-bold">{b.text}</h2>;
          case "p":
            return <p key={i}><Rich text={b.text} /></p>;
          case "list":
            return <ul key={i}>{b.items.map((it, j) => <li key={j}><Rich text={it} /></li>)}</ul>;
          case "callout": {
            const t = tones[b.tone];
            return (
              <div key={i} className={`my-6 rounded-2xl border p-5 ${t.box}`}>
                <div className={`mb-1 font-semibold ${t.title}`}>{t.icon} <Rich text={b.title} /></div>
                <div className="leading-relaxed text-[#2d2748]"><Rich text={b.text} /></div>
              </div>
            );
          }
          case "stats":
            return (
              <div key={i} className="my-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {b.items.map((s, j) => (
                  <div key={j} className={`rounded-2xl bg-gradient-to-br ${statColors[j % 4]} p-4 text-white shadow`}>
                    <div className="font-display text-2xl font-bold">{s.value}</div>
                    <div className="mt-1 text-xs leading-snug opacity-95">{s.label}</div>
                  </div>
                ))}
              </div>
            );
          case "steps":
            return (
              <ol key={i} className="my-6 space-y-3">
                {b.items.map((s, j) => (
                  <li key={j} className="card flex gap-4 p-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">{j + 1}</span>
                    <div>
                      <div className="font-semibold">{s.title}</div>
                      <div className="mt-1 text-sm leading-relaxed text-[#3a3456]"><Rich text={s.text} /></div>
                    </div>
                  </li>
                ))}
              </ol>
            );
          case "table":
            return (
              <div key={i} className="my-6 overflow-x-auto rounded-2xl border border-line bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gradient-to-r from-violet-50 to-fuchsia-50">
                    <tr>{b.head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} className="border-t border-line">
                        {r.map((c, k) => <td key={k} className="px-4 py-3 align-top text-[#3a3456]"><Rich text={c} /></td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
