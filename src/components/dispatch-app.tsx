import { Link } from "@tanstack/react-router";
import { CREWS, CORPUS, TERRITORY, ageLabel } from "@/lib/corpus";
import { useStorm } from "@/lib/store";
import { FeederMap } from "./feeder-map";

export function DispatchApp() {
  const { reports, resolveReport } = useStorm();
  const held = reports.filter((r) => r.status === "held");
  const live = CORPUS.filter((d) => d.kind === "oms" || d.kind === "hazard");

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div>
          <p className="text-sm font-medium">Utility Control Center</p>
          <p className="font-mono text-[11px] tracking-wide text-muted uppercase">
            Publish Gate · {TERRITORY.utility} · {TERRITORY.name}
          </p>
        </div>
        <Link to="/" className="inline-flex min-h-10 items-center border border-border px-3 font-mono text-[11px] uppercase text-muted">
          Crew tablet
        </Link>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-5 sm:px-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-4">
          <p className="font-mono text-[11px] tracking-widest text-accent uppercase">
            High-risk queue · {held.length} held
          </p>
          {held.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No held reports. Low-risk inventory auto-publishes.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {held.map((r) => (
                <li key={r.id} className="rounded-md border border-border bg-bg p-3">
                  <p className="font-mono text-[11px] text-hazard uppercase">
                    {r.kind} · {r.crewId} · {r.feeder_id}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{r.summary}</p>
                  {r.conflict ? <p className="mt-1 text-sm text-warn">{r.conflict}</p> : null}
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => resolveReport(r.id, "approved")}
                      className="min-h-11 flex-1 rounded-md bg-accent font-mono text-[12px] text-accent-fg"
                    >
                      Approve to fleet
                    </button>
                    <button
                      type="button"
                      onClick={() => resolveReport(r.id, "rejected")}
                      className="min-h-11 flex-1 rounded-md border border-border font-mono text-[12px]"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <div className="h-52 rounded-xl border border-border bg-surface p-2">
            <FeederMap highlight="F-12" />
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="font-mono text-[11px] tracking-widest text-accent uppercase">OMS + hazards</p>
            <ul className="mt-3 space-y-2">
              {live.map((d) => (
                <li key={d.id} className="border-b border-border pb-2 text-sm last:border-0">
                  <span className="font-mono text-[11px] text-muted">
                    {d.feeder_id} · {ageLabel(d.timestamp)} · {d.confirmation_status}
                  </span>
                  <p>{d.title}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="font-mono text-[11px] tracking-widest text-accent uppercase">Fleet</p>
            <ul className="mt-3 space-y-2">
              {CREWS.map((c) => (
                <li key={c.id} className="flex justify-between gap-3 text-sm">
                  <span>
                    {c.id} {c.name}
                    <span className="block font-mono text-[11px] text-muted">
                      {c.feeder_id} · trust {c.trust}
                    </span>
                  </span>
                  <span className="max-w-48 text-right text-muted">{c.assignment}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
