import PageHeader from "@/components/PageHeader";
import ChatPanel from "@/components/ChatPanel";

export const metadata = { title: "FAHR Guide · AI Assistant" };

export default function AssistantPage() {
  return (
    <div>
      <PageHeader kicker="AI tutor · Bring your own key" title="Chat with FAHR Guide">
        Ask anything about FaceAge, FAHR-Face, the oncology evidence or the labs. The assistant runs on Groq with your own
        free API key, and it is grounded in the two Lancet Digital Health papers behind this app.
      </PageHeader>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-[1fr_300px]">
        <ChatPanel variant="page" />
        <aside className="space-y-4 text-sm">
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold">How to start</h2>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted">
              <li>Create a free key at <a className="font-semibold text-violet-700 underline" href="https://console.groq.com/keys" target="_blank" rel="noreferrer">console.groq.com/keys</a>.</li>
              <li>Paste it in the settings panel and press <strong>Save &amp; test key</strong>.</li>
              <li>Pick a model and start asking.</li>
            </ol>
          </div>
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold">What it knows</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted">
              <li>FaceAge (Bontempi et al., 2025)</li>
              <li>FAHR-Face, FAHR-FaceAge and FAHR-FaceSurvival (Haugg et al., 2026)</li>
              <li>All 10 learning modules and 7 labs</li>
              <li>The page you are on when you open the floating assistant</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950">⚠️ AI answers can contain mistakes. FAHR Guide is an educational tutor, not a doctor.</div>
        </aside>
      </div>
    </div>
  );
}
