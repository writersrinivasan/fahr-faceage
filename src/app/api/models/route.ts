/** Validates a visitor's Groq key and returns the chat models it can use. The key is not stored. */
export async function GET(req: Request) {
  const key = req.headers.get("x-groq-key")?.trim();
  if (!key || key.length > 200) return Response.json({ error: "Missing API key." }, { status: 401 });
  const r = await fetch("https://api.groq.com/openai/v1/models", { headers: { Authorization: `Bearer ${key}` } }).catch(() => null);
  if (!r) return Response.json({ error: "Could not reach Groq." }, { status: 502 });
  if (!r.ok) return Response.json({ error: r.status === 401 ? "Groq rejected this API key." : `Groq returned ${r.status}.` }, { status: r.status });
  const j = (await r.json()) as { data?: { id: string; active?: boolean }[] };
  const models = (j.data ?? [])
    .filter((m) => m.active !== false && !/whisper|guard|tts|orpheus|playai|distil/i.test(m.id))
    .map((m) => m.id)
    .sort();
  return Response.json({ models });
}
