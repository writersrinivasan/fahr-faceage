import { buildSystemPrompt } from "@/lib/assistantKnowledge";

const GROQ = "https://api.groq.com/openai/v1/chat/completions";
type Msg = { role: "user" | "assistant"; content: string };

/** BYOK relay: the visitor's Groq key arrives in a header, is used for this one request, and is never stored or logged. */
export async function POST(req: Request) {
  const key = req.headers.get("x-groq-key")?.trim();
  if (!key || key.length > 200) return Response.json({ error: "Missing Groq API key. Add your key in the assistant settings." }, { status: 401 });

  let body: { messages?: Msg[]; model?: string; path?: string };
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid request body." }, { status: 400 }); }

  const model = typeof body.model === "string" && /^[\w.\-/:]{1,80}$/.test(body.model) ? body.model : "llama-3.3-70b-versatile";
  const path = typeof body.path === "string" ? body.path.slice(0, 100) : "/";
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-16)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    // keep the most recent turns within ~10k characters so free-tier token limits are respected
    .reduceRight<Msg[]>((acc, m) => (acc.reduce((n, x) => n + x.content.length, 0) + m.content.length > 10000 && acc.length ? acc : [m, ...acc]), []);
  if (!messages.length || messages[messages.length - 1].role !== "user") return Response.json({ error: "Send a question first." }, { status: 400 });

  const upstream = await fetch(GROQ, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: true,
      temperature: 0.4,
      max_completion_tokens: 1200,
      messages: [{ role: "system", content: buildSystemPrompt(path) }, ...messages],
    }),
    signal: req.signal,
  }).catch((e: unknown) => e as Error);

  if (upstream instanceof Error) return Response.json({ error: "Could not reach Groq. Check your connection." }, { status: 502 });
  if (!upstream.ok || !upstream.body) {
    let msg = `Groq returned ${upstream.status}.`;
    try { const j = await upstream.json(); if (j?.error?.message) msg = j.error.message; } catch {}
    if (upstream.status === 401) msg = "Groq rejected this API key. Check it at console.groq.com/keys.";
    if (upstream.status === 429) msg = `Rate limit reached on your Groq key. ${msg}`;
    return Response.json({ error: msg }, { status: upstream.status });
  }
  return new Response(upstream.body, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform" },
  });
}
