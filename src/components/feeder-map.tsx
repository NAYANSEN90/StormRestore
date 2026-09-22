import { CREW } from "@/lib/corpus";

const FEEDERS = [
  { id: "F-07", x1: 18, y1: 40, x2: 46, y2: 28, out: false },
  { id: "F-12", x1: 18, y1: 40, x2: 70, y2: 62, out: true },
  { id: "F-19", x1: 18, y1: 40, x2: 38, y2: 78, out: false },
];

export function FeederMap({ highlight = CREW.feeder_id }: { highlight?: string }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full text-muted" aria-label="Cedar Ridge feeder schematic">
      <rect x="8" y="32" width="16" height="16" className="fill-surface-2 stroke-border" strokeWidth="0.8" />
      <text x="16" y="42" textAnchor="middle" className="fill-fg" fontSize="4" fontFamily="IBM Plex Mono, monospace">
        SUB
      </text>
      {FEEDERS.map((f) => (
        <g key={f.id}>
          <line
            x1={f.x1}
            y1={f.y1}
            x2={f.x2}
            y2={f.y2}
            className={f.id === highlight ? "stroke-hazard" : f.out ? "stroke-warn" : "stroke-live"}
            strokeWidth={f.id === highlight ? 2.2 : 1.4}
          />
          <circle cx={f.x2} cy={f.y2} r="2.2" className={f.id === highlight ? "fill-hazard" : "fill-accent"} />
          <text x={f.x2 + 3} y={f.y2 + 1.5} className="fill-fg" fontSize="4" fontFamily="IBM Plex Mono, monospace">
            {f.id}
          </text>
        </g>
      ))}
      <circle cx="70" cy="62" r="6" className="fill-none stroke-hazard" strokeDasharray="2 2" />
      <text x="70" y="74" textAnchor="middle" className="fill-hazard" fontSize="3.5" fontFamily="IBM Plex Mono, monospace">
        12-088
      </text>
    </svg>
  );
}
