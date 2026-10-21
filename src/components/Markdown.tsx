import { Fragment, type ReactNode } from "react";

/** Minimal, safe markdown renderer for chat replies (no raw HTML). */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(<Fragment key={k++}>{text.slice(last, m.index)}</Fragment>);
    const t = m[0];
    if (t.startsWith("`")) out.push(<code key={k++} className="rounded bg-violet-100 px-1 py-0.5 font-mono text-[0.85em]">{t.slice(1, -1)}</code>);
    else if (t.startsWith("**")) out.push(<strong key={k++}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith("*")) out.push(<em key={k++}>{t.slice(1, -1)}</em>);
    else {
      const [, label, href] = t.match(/\[([^\]]+)\]\(([^)]+)\)/)!;
      const safe = /^(https?:\/\/|\/)/.test(href) ? href : "#";
      out.push(<a key={k++} href={safe} target={safe.startsWith("/") ? undefined : "_blank"} rel="noreferrer" className="font-medium text-violet-700 underline">{label}</a>);
    }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(<Fragment key={k++}>{text.slice(last)}</Fragment>);
  return out;
}

export default function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const nodes: ReactNode[] = [];
  let i = 0, k = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith("```")) {
      const code: string[] = []; i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      nodes.push(<pre key={k++} className="my-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100"><code>{code.join("\n")}</code></pre>);
    } else if (/^#{1,4}\s/.test(l)) {
      nodes.push(<div key={k++} className="mt-3 mb-1 font-display font-bold">{inline(l.replace(/^#+\s/, ""))}</div>); i++;
    } else if (/^\s*[-*•]\s/.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*•]\s/, ""));
      nodes.push(<ul key={k++} className="my-1.5 list-disc space-y-1 pl-5">{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ul>);
    } else if (/^\s*\d+[.)]\s/.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s/, ""));
      nodes.push(<ol key={k++} className="my-1.5 list-decimal space-y-1 pl-5">{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ol>);
    } else if (l.trim() === "") { i++; }
    else {
      const para: string[] = [];
      while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,4}\s|\s*[-*•]\s|\s*\d+[.)]\s|```)/.test(lines[i])) para.push(lines[i++]);
      nodes.push(<p key={k++} className="my-1.5 leading-relaxed">{inline(para.join(" "))}</p>);
    }
  }
  return <>{nodes}</>;
}
