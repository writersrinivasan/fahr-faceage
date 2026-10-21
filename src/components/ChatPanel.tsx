"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Markdown from "./Markdown";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };
const KEY_LS = "faceage-groq-key";
const MODEL_LS = "faceage-groq-model";
const CHAT_SS = "faceage-chat";
const DEFAULT_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "openai/gpt-oss-120b", "openai/gpt-oss-20b"];

const store = {
  get(k: string, session = false) { try { return (session ? sessionStorage : localStorage).getItem(k); } catch { return null; } },
  set(k: string, v: string, session = false) { try { (session ? sessionStorage : localStorage).setItem(k, v); } catch {} },
  del(k: string) { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch {} },
};

function suggestions(path: string) {
  if (path.startsWith("/learn/fahr")) return ["Explain masked autoencoders like I'm 15", "How is FAHR-FaceSurvival different from FAHR-FaceAge?", "What does HR 3.23 between quartiles mean?"];
  if (path.startsWith("/learn/")) return ["Summarise this module in 5 bullets", "Quiz me on this module", "What are the limitations here?"];
  if (path.startsWith("/lab/")) return ["What should I try first in this lab?", "Explain what this simulation shows", "How does this relate to the real study?"];
  return ["What is FAHR-Face in simple words?", "Can FaceAge detect cancer?", "How did FaceAge help doctors predict survival?", "Compare FaceAge (2025) and FAHR-Face (2026)"];
}

export default function ChatPanel({ variant = "panel", onClose }: { variant?: "panel" | "page"; onClose?: () => void }) {
  const path = usePathname();
  const [key, setKey] = useState("");
  const [draftKey, setDraftKey] = useState("");
  const [remember, setRemember] = useState(true);
  const [settings, setSettings] = useState(false);
  const [models, setModels] = useState<string[]>(DEFAULT_MODELS);
  const [model, setModel] = useState(DEFAULT_MODELS[0]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [keyStatus, setKeyStatus] = useState("");
  const abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const k = store.get(KEY_LS) || store.get(KEY_LS, true) || "";
    setKey(k); setSettings(!k);
    setModel(store.get(MODEL_LS) || DEFAULT_MODELS[0]);
    try { setMsgs(JSON.parse(store.get(CHAT_SS, true) || "[]")); } catch {}
  }, []);
  useEffect(() => { if (!busy) store.set(CHAT_SS, JSON.stringify(msgs.slice(-40)), true); }, [msgs, busy]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs]);

  async function saveKey() {
    const k = draftKey.trim();
    if (!k) return;
    setKeyStatus("Checking key with Groq…");
    const r = await fetch("/api/models", { headers: { "x-groq-key": k } }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (!r || !r.ok) { setKeyStatus(`❌ ${j.error || "Could not verify the key."}`); return; }
    store.del(KEY_LS);
    store.set(KEY_LS, k, !remember);
    setKey(k); setDraftKey(""); setKeyStatus(""); setSettings(false);
    if (Array.isArray(j.models) && j.models.length) {
      setModels(j.models);
      if (!j.models.includes(model)) setModel(j.models.includes(DEFAULT_MODELS[0]) ? DEFAULT_MODELS[0] : j.models[0]);
    }
  }
  function forgetKey() { store.del(KEY_LS); setKey(""); setSettings(true); }

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    if (!key) { setSettings(true); return; }
    const history = [...msgs.filter((m) => !m.error), { role: "user" as const, content: q }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    setInput(""); setBusy(true);
    abort.current = new AbortController();
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-groq-key": key },
        body: JSON.stringify({ model, path, messages: history.map(({ role, content }) => ({ role, content })) }),
        signal: abort.current.signal,
      });
      if (!r.ok || !r.body) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${r.status}).`);
      }
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "", acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const data = t.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const j = JSON.parse(data);
            if (j.error) throw new Error(j.error.message || "Stream error");
            const d = j.choices?.[0]?.delta?.content;
            if (d) { acc += d; setMsgs((m) => [...m.slice(0, -1), { role: "assistant", content: acc }]); }
          } catch (e) { if (e instanceof Error && e.message !== "Unexpected end of JSON input" && !(e instanceof SyntaxError)) throw e; }
        }
      }
      if (!acc) setMsgs((m) => [...m.slice(0, -1), { role: "assistant", content: "_(No response received. Try another model.)_" }]);
    } catch (e) {
      const aborted = e instanceof DOMException && e.name === "AbortError";
      setMsgs((m) => {
        const last = m[m.length - 1];
        if (aborted) return last?.content ? m : m.slice(0, -1);
        return [...m.slice(0, -1), { role: "assistant", content: `⚠️ ${e instanceof Error ? e.message : "Something went wrong."}`, error: true }];
      });
    } finally { setBusy(false); abort.current = null; }
  }

  const tall = variant === "page" ? "h-[calc(100vh-15rem)] min-h-[420px]" : "h-full";

  return (
    <div className={`flex flex-col overflow-hidden bg-white ${variant === "page" ? "card" : ""} ${tall}`}>
      <div className="flex items-center gap-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 px-4 py-3 text-white">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 text-lg">🤖</span>
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold leading-tight">FAHR Guide</div>
          <div className="truncate text-xs opacity-90">AI tutor · your own Groq key · {key ? model : "not connected"}</div>
        </div>
        <button onClick={() => setSettings(!settings)} className="rounded-lg bg-white/20 px-2.5 py-1.5 text-xs font-semibold hover:bg-white/30" aria-label="Assistant settings">⚙️</button>
        {msgs.length > 0 && <button onClick={() => setMsgs([])} className="rounded-lg bg-white/20 px-2.5 py-1.5 text-xs font-semibold hover:bg-white/30">New chat</button>}
        {onClose && <button onClick={onClose} className="rounded-lg bg-white/20 px-2.5 py-1.5 text-xs font-semibold hover:bg-white/30" aria-label="Close assistant">✕</button>}
      </div>

      {settings ? (
        <div className="flex-1 space-y-4 overflow-y-auto p-5 text-sm">
          <div>
            <h3 className="font-display text-lg font-bold">🔑 Bring your own key</h3>
            <p className="mt-1 text-muted">This assistant runs on <strong>Groq</strong> using your own free API key. Create one at{" "}
              <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="font-semibold text-violet-700 underline">console.groq.com/keys</a>, then paste it below.</p>
          </div>
          {key ? (
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
              <span>✅ Key connected: <code className="font-mono">{key.slice(0, 7)}…{key.slice(-4)}</code></span>
              <button onClick={forgetKey} className="font-semibold text-rose-600">Remove</button>
            </div>
          ) : null}
          <div className="space-y-2">
            <input type="password" value={draftKey} onChange={(e) => setDraftKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveKey()}
              placeholder="gsk_…" autoComplete="off" spellCheck={false} className="w-full rounded-xl border border-line px-3 py-2.5 font-mono outline-none focus:ring-2 focus:ring-violet-400" />
            <label className="flex items-center gap-2 text-muted">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-violet-600" />
              Remember on this device (otherwise forgotten when the tab closes)
            </label>
            <button onClick={saveKey} disabled={!draftKey.trim()} className="w-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 font-semibold text-white shadow disabled:opacity-40">Save &amp; test key</button>
            {keyStatus && <p className="text-sm">{keyStatus}</p>}
          </div>
          <div>
            <label className="mb-1 block font-medium">Model</label>
            <select value={model} onChange={(e) => { setModel(e.target.value); store.set(MODEL_LS, e.target.value); }} className="w-full rounded-xl border border-line bg-white px-3 py-2.5">
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <p className="mt-1 text-xs text-muted">llama-3.3-70b-versatile gives the best answers. llama-3.1-8b-instant is fastest and kindest to free-tier limits.</p>
          </div>
          <div className="rounded-xl bg-sky-50 p-3 text-xs text-sky-950">
            🔒 <strong>Privacy:</strong> your key stays in this browser. It is sent only with your chat requests, which this app relays to Groq without storing or logging it. Usage counts against your own Groq account. Avoid sharing personal health details in chat.
          </div>
          {key && <button onClick={() => setSettings(false)} className="font-semibold text-violet-700">← Back to chat</button>}
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-violet-50/60 to-white p-4">
            {msgs.length === 0 && (
              <div className="space-y-3">
                <div className="rounded-2xl rounded-tl-sm bg-white p-3 text-sm shadow-sm ring-1 ring-line">
                  👋 Hi! I&apos;m <strong>FAHR Guide</strong>. Ask me anything about FaceAge, FAHR-Face, the oncology evidence or the labs. I know which page you&apos;re on.
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions(path).map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full bg-white px-3 py-1.5 text-left text-xs font-medium text-violet-700 ring-1 ring-violet-200 hover:bg-violet-50">{s}</button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-2xl px-3.5 py-2 text-sm ${m.role === "user" ? "rounded-tr-sm bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white" : m.error ? "rounded-tl-sm bg-rose-50 text-rose-900 ring-1 ring-rose-200" : "rounded-tl-sm bg-white shadow-sm ring-1 ring-line"}`}>
                  {m.role === "user" ? <p className="whitespace-pre-wrap">{m.content}</p> : m.content ? <Markdown text={m.content} /> : <span className="inline-flex gap-1 py-1"><span className="h-2 w-2 animate-bounce rounded-full bg-fuchsia-400" /><span className="h-2 w-2 animate-bounce rounded-full bg-fuchsia-400 [animation-delay:.15s]" /><span className="h-2 w-2 animate-bounce rounded-full bg-fuchsia-400 [animation-delay:.3s]" /></span>}
                </div>
              </div>
            ))}
            <div ref={end} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-line p-3">
            <div className="flex items-end gap-2">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={1} maxLength={4000}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder={key ? "Ask about FaceAge or FAHR-Face…" : "Add your Groq key in settings to start"}
                className="max-h-32 min-h-[42px] flex-1 resize-none rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-400" />
              {busy ? (
                <button type="button" onClick={() => abort.current?.abort()} className="rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white">Stop</button>
              ) : (
                <button type="submit" disabled={!input.trim()} className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Send</button>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-muted">AI answers can be wrong. Educational use only, not medical advice.</p>
          </form>
        </>
      )}
    </div>
  );
}
