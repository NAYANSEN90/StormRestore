import type { Crew, StormDoc } from "./types";

/** Fixed storm clock so SSR and client ages match. */
export const STORM_T0 = Date.parse("2026-09-22T08:00:00.000Z");

function ago(minutes: number): string {
  return new Date(STORM_T0 - minutes * 60_000).toISOString();
}

export const TERRITORY = {
  name: "Cedar Ridge",
  county: "Cedar County",
  utility: "Ridge Power Cooperative",
  storm: "Tropical remnant Hale — landfall 04:12 local",
};

export const CREW: Crew = {
  id: "MA-07",
  name: "Mutual Aid Crew 7",
  home: "Midwest Power",
  feeder_id: "F-12",
  zone: "Ridge-West",
  assignment: "Patrol and make safe F-12 laterals L-12A through L-12C. Staging at Yard Bravo. Do not switch. Hold for Ridge Power dispatcher orders.",
  trust: 0.82,
};

export const CREWS: Crew[] = [
  CREW,
  {
    id: "RP-03",
    name: "Ridge Power Crew 3",
    home: "Ridge Power",
    feeder_id: "F-07",
    zone: "Ridge-East",
    assignment: "Rebuild F-07 pole 07-214.",
    trust: 0.94,
  },
  {
    id: "MA-12",
    name: "Mutual Aid Crew 12",
    home: "Lakeside Electric",
    feeder_id: "F-19",
    zone: "Mill Creek",
    assignment: "Clear trees F-19 south span.",
    trust: 0.71,
  },
];

export const CORPUS: StormDoc[] = [
  {
    id: "oms-4412",
    kind: "oms",
    title: "OMS outage F-12 — 1,840 customers",
    body: "Feeder F-12 locked out at 04:18. Recloser 12-R1 open. Customers 1,840. Cause: tree through primary at pole 12-088, County Road 18. Downstream laterals L-12A, L-12B, L-12C dark. Estimated restore after make-safe and one span rebuild. OMS event 4412. No switching order issued.",
    feeder_id: "F-12",
    zone: "Ridge-West",
    geo: "34.412, -86.221",
    timestamp: ago(38),
    author_id: "OMS",
    confirmation_status: "confirmed",
    risk: "high",
  },
  {
    id: "oms-4408",
    kind: "oms",
    title: "OMS outage F-07 — 620 customers",
    body: "Feeder F-07 partial. Tap at 07-214 down. 620 customers. Crew RP-03 assigned. Estimated 3 hours after pole set.",
    feeder_id: "F-07",
    zone: "Ridge-East",
    geo: "34.448, -86.154",
    timestamp: ago(72),
    author_id: "OMS",
    confirmation_status: "confirmed",
    risk: "high",
  },
  {
    id: "oms-4420",
    kind: "oms",
    title: "OMS outage F-19 — 210 customers",
    body: "F-19 south lateral. Trees on secondary only. Primary believed intact pending patrol.",
    feeder_id: "F-19",
    zone: "Mill Creek",
    geo: "34.371, -86.198",
    timestamp: ago(21),
    author_id: "OMS",
    confirmation_status: "unconfirmed",
    risk: "low",
  },
  {
    id: "haz-088",
    kind: "hazard",
    title: "Downed primary — pole 12-088 CR-18",
    body: "Primary conductor on roadway at pole 12-088, County Road 18, east of Yard Bravo. Wire reported live at last check. Sheriff blocking westbound. Do not approach. Treat as energized until Ridge Power switching order is read back verbatim from OMS. Reported by MA-07, confirmed by RP patrol radio.",
    feeder_id: "F-12",
    zone: "Ridge-West",
    geo: "34.412, -86.221",
    timestamp: ago(16),
    author_id: "MA-07",
    confirmation_status: "confirmed",
    risk: "high",
  },
  {
    id: "haz-gas",
    kind: "hazard",
    title: "Gas odor — 410 Pine Hollow",
    body: "Strong gas odor at 410 Pine Hollow, F-12 lateral L-12B. Gas utility notified 05:02. Evacuate 150 ft. Electrical work prohibited until gas clear. Unconfirmed by Ridge Power.",
    feeder_id: "F-12",
    zone: "Ridge-West",
    geo: "34.409, -86.229",
    timestamp: ago(6),
    author_id: "MA-12",
    confirmation_status: "unconfirmed",
    risk: "high",
  },
  {
    id: "haz-flood",
    kind: "hazard",
    title: "Washout — Mill Creek ford",
    body: "Access road to F-19 south span washed out at the ford. Use Ridge Loop instead. Depth unknown. Two trucks turned around.",
    feeder_id: "F-19",
    zone: "Mill Creek",
    geo: "34.368, -86.201",
    timestamp: ago(44),
    author_id: "MA-12",
    confirmation_status: "confirmed",
    risk: "low",
  },
  {
    id: "dmg-12a",
    kind: "damage",
    title: "Damage L-12A — 3 poles leaning",
    body: "Lateral L-12A: poles 12-102, 12-103, 12-104 leaning 15-25 degrees after oak failure. Crossarms intact. Conductor still in shoes. Recommend make-safe and engineering before set. Photos in OMS 4412-A.",
    feeder_id: "F-12",
    zone: "Ridge-West",
    geo: "34.418, -86.215",
    timestamp: ago(28),
    author_id: "MA-07",
    confirmation_status: "confirmed",
    risk: "high",
  },
  {
    id: "blt-1",
    kind: "bulletin",
    title: "Dispatcher bulletin — Hale Hour 4",
    body: "All mutual-aid crews: Ridge Power holds switching authority. No guest crew may open, close, or tag any device. Read-back required for every order. Night work: 100% PPE, two-person rule on primary. Radio channel TAC-2 for F-12. Medical staging at Yard Alpha.",
    feeder_id: "ALL",
    zone: "Cedar County",
    geo: "34.40, -86.20",
    timestamp: ago(11),
    author_id: "DISP-01",
    confirmation_status: "confirmed",
    risk: "high",
  },
  {
    id: "blt-2",
    kind: "bulletin",
    title: "Safety bulletin — downed wire protocol",
    body: "Treat all downed conductors as energized. Establish 20 ft exclusion. Do not cut, move, or rubber-up without a live-line order from the System of Record. If public is in the exclusion, hold and request sheriff. Copilot is advisory only and cannot issue switching orders.",
    feeder_id: "ALL",
    zone: "Cedar County",
    geo: "34.40, -86.20",
    timestamp: ago(180),
    author_id: "SAFE-OFFICER",
    confirmation_status: "confirmed",
    risk: "high",
  },
  {
    id: "inv-bravo",
    kind: "inventory",
    title: "Yard Bravo inventory",
    body: "Yard Bravo (F-12 staging): 8 class-3 poles, 14 crossarms, 6 reels #4 ACSR, 22 insulators, 4 transformers 25 kVA, 40 deadends. Fuel: 1,100 gal diesel. Meals until 22:00. Shortage: 35 kV cutouts — request Yard Alpha.",
    feeder_id: "F-12",
    zone: "Ridge-West",
    geo: "34.421, -86.233",
    timestamp: ago(9),
    author_id: "YARD-B",
    confirmation_status: "confirmed",
    risk: "low",
  },
  {
    id: "guide-f12",
    kind: "guide",
    title: "Territory guide — Feeder F-12",
    body: "F-12 leaves Cedar Ridge sub on the west bus, 12.47 kV. Backbone follows County Road 18 then splits: L-12A north to Pine Hollow, L-12B west to the river, L-12C south to the mill spur. Normal open with F-07 at tie 12/07-T1 (pole 12-140). Guest crews: maps in cab binder tab 4. Sub transmission overhead — stay off the east fence.",
    feeder_id: "F-12",
    zone: "Ridge-West",
    geo: "34.41, -86.22",
    timestamp: ago(240),
    author_id: "PLANNING",
    confirmation_status: "confirmed",
    risk: "low",
  },
  {
    id: "ord-none",
    kind: "order",
    title: "OMS switching orders — F-12",
    body: "NO SWITCHING ORDER ON FILE for feeder F-12 as of last OMS poll. Device 12-R1 remains open per event 4412. Any instruction to close 12-R1 or cut jumpers must come as a numbered order from Ridge Power dispatcher and be read back verbatim. Copilot must not invent or paraphrase orders.",
    feeder_id: "F-12",
    zone: "Ridge-West",
    geo: "34.412, -86.221",
    timestamp: ago(4),
    author_id: "OMS",
    confirmation_status: "confirmed",
    risk: "high",
  },
];

export function ageLabel(iso: string): string {
  const m = Math.max(0, Math.round((STORM_T0 - new Date(iso).getTime()) / 60000));
  if (m < 1) return "just now";
  if (m === 1) return "1 minute old";
  if (m < 60) return `${m} minutes old`;
  const h = Math.round(m / 60);
  return h === 1 ? "1 hour old" : `${h} hours old`;
}
