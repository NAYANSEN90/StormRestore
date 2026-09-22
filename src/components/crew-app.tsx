import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Mic, Radio, Send, ShieldAlert } from "lucide-react";
import { CREW, TERRITORY, CORPUS, ageLabel } from "@/lib/corpus";
import { askCopilot } from "@/lib/supervisor";
import { useStorm } from "@/lib/store";
import type { CopilotAnswer, FieldReport } from "@/lib/types";
import { FeederMap } from "./feeder-map";

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.slice(0, 400));
  u.rate = 1.02;
  window.speechSynthesis.speak(u);
}

export function CrewApp() {
  const { link, setLink, chat, pushChat, submitReport, reports } = useStorm();
  const [draft, setDraft] = useState("");
  const [report, setReport] = useState("");
  const [kind, setKind] = useState<FieldReport["kind"]>("hazard");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognition | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const nearby = CORPUS.filter(
    (d) => d.feeder_id === CREW.feeder_id && (d.kind === "hazard" || d.kind === "oms"),
  ).slice(0, 3);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.length]);

  async function ask(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setBusy(true);
    pushChat({ id: `c-${Date.now()}`, role: "crew", text: q });
    setDraft("");
    try {
      const answer: CopilotAnswer = await askCopilot({ data: { query: q, link } });
      pushChat({ id: `a-${Date.now()}`, role: "copilot", text: answer.text, answer });
      speak(answer.text);
    } catch (err) {
      pushChat({
        id: `e-${Date.now()}`,
        role: "copilot",
        text: err instanceof Error ? err.message : "Copilot failed.",
      });
    } finally {
      setBusy(false);
    }
  }

  function toggleListen() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      void ask(draft || "What hazards are on feeder F-12?");
      return;
    }
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const said = e.results[0]?.[0]?.transcript;
      if (said) void ask(said);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  function sendReport() {
    if (report.trim().length < 8) return;
    const r = submitReport(report.trim(), kind);
    setReport("");
    pushChat({
      id: `r-${r.id}`,
      role: "copilot",
      text:
        r.status === "held"
          ? `Publish Gate HOLD (${r.risk}). Dispatcher must approve. ${r.conflict ?? ""}`
          : `Publish Gate AUTO-PUBLISHED (${r.risk}) to the fleet index.`,
    });
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center bg-accent font-mono text-[10px] font-medium text-accent-fg">
            SRC
          </span>
          <div>
            <p className="text-sm font-medium">Storm Restoration Copilot</p>
            <p className="font-mono text-[11px] tracking-wide text-muted uppercase">
              {TERRITORY.county} · {TERRITORY.storm}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 border border-border px-2 py-1 font-mono text-[11px] text-muted uppercase">
            link
            <select
              value={link}
              onChange={(e) => setLink(e.target.value as typeof link)}
              className="bg-bg text-fg outline-none"
            >
              <option value="online">online</option>
              <option value="degraded">degraded</option>
              <option value="offline">offline</option>
            </select>
          </label>
          <Link
            to="/dispatch"
            className="inline-flex min-h-10 items-center border border-border px-3 font-mono text-[11px] uppercase text-muted"
          >
            Dispatcher
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-4 sm:rounded-xl sm:p-5">
            <p className="font-mono text-[11px] tracking-widest text-accent uppercase">Your assignment</p>
            <p className="mt-1 font-mono text-xs text-muted">
              {CREW.id} · {CREW.name} · {CREW.home} · trust {CREW.trust}
            </p>
            <p className="mt-3 leading-relaxed">{CREW.assignment}</p>
            <p className="mt-3 flex items-center gap-2 font-mono text-[11px] text-hazard uppercase">
              <ShieldAlert className="size-3.5" /> Advisory only — no switching from this device
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="font-mono text-[11px] tracking-widest text-accent uppercase">Live storm picture · {CREW.feeder_id}</p>
            <ul className="mt-3 space-y-2">
              {nearby.map((d) => (
                <li key={d.id} className="flex gap-3 border-b border-border pb-2 last:border-0">
                  <AlertTriangle className={`mt-0.5 size-4 ${d.risk === "high" ? "text-hazard" : "text-warn"}`} />
                  <div>
                    <p className="text-sm">{d.title}</p>
                    <p className="font-mono text-[11px] text-muted">
                      {d.kind} · {ageLabel(d.timestamp)} · {d.confirmation_status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="font-mono text-[11px] tracking-widest text-accent uppercase">Copilot</p>
            <div ref={logRef} className="mt-3 max-h-72 min-h-40 overflow-y-auto rounded-md border border-border bg-bg p-3">
              {chat.length === 0 ? (
                <p className="text-sm text-muted">
                  Hands-free: hold mic, or type. Try “hazards on F-12”, “yard inventory”, or “close the recloser”.
                </p>
              ) : (
                chat.map((m) => (
                  <div key={m.id} className={m.role === "copilot" ? "mb-3 border-l-2 border-accent pl-3" : "mb-3"}>
                    <p className="font-mono text-[10px] tracking-widest text-muted">
                      {m.role === "copilot" ? "COPILOT" : "CREW"}
                      {m.answer?.local ? " · local moss" : m.answer ? " · reasoner" : ""}
                      {m.answer?.blocked ? " · blocked" : ""}
                      {m.answer?.escalate ? " · escalate TAC-2" : ""}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{m.text}</p>
                    {m.answer?.sources?.length ? (
                      <ul className="mt-2 space-y-1">
                        {m.answer.sources.map((s) => (
                          <li key={s.title} className="font-mono text-[11px] text-muted">
                            {s.title} · {s.age} · {s.kind}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))
              )}
            </div>
            <form
              className="mt-3 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                void ask(draft);
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask the live storm picture…"
                className="h-11 min-w-0 flex-1 rounded-md border border-border bg-bg px-3 text-[15px] outline-none placeholder:text-subtle focus:border-accent"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleListen}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 ${
                    listening ? "border-hazard bg-hazard text-fg" : "border-border text-fg"
                  }`}
                  aria-label="Voice"
                >
                  <Mic className="size-4" />
                </button>
                <button
                  type="submit"
                  disabled={busy || !draft.trim()}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-accent px-4 font-mono text-[13px] font-medium text-accent-fg disabled:opacity-50"
                >
                  <Send className="size-4" /> Ask
                </button>
              </div>
            </form>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="h-56 rounded-xl border border-border bg-surface p-2">
            <FeederMap />
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="font-mono text-[11px] tracking-widest text-accent uppercase">Field report · Publish Gate</p>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as FieldReport["kind"])}
              className="mt-3 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm outline-none"
            >
              <option value="hazard">Hazard</option>
              <option value="damage">Damage</option>
              <option value="inventory">Inventory</option>
            </select>
            <textarea
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="What did you find? Inventory auto-publishes. Hazards hold for dispatcher."
              className="mt-2 min-h-24 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none placeholder:text-subtle focus:border-accent"
            />
            <button
              type="button"
              onClick={sendReport}
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-accent font-mono text-[13px] font-medium text-accent-fg"
            >
              <Radio className="size-4" /> Submit to gate
            </button>
            {reports[0] ? (
              <p className="mt-2 font-mono text-[11px] text-muted">
                Last: {reports[0].status} · {reports[0].risk}
              </p>
            ) : null}
          </div>
        </aside>
      </main>
    </div>
  );
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognition };
    webkitSpeechRecognition?: { new (): SpeechRecognition };
  }
  interface SpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    start(): void;
    stop(): void;
    onresult: ((ev: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
  }
  interface SpeechRecognitionEvent extends Event {
    results: { [i: number]: { [j: number]: { transcript: string } } };
  }
}
