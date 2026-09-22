export type DocKind =
  | "oms"
  | "hazard"
  | "damage"
  | "bulletin"
  | "inventory"
  | "guide"
  | "order";

export type Confirmation = "confirmed" | "unconfirmed" | "disputed";

export type StormDoc = {
  id: string;
  kind: DocKind;
  title: string;
  body: string;
  feeder_id: string;
  zone: string;
  geo: string;
  timestamp: string;
  author_id: string;
  confirmation_status: Confirmation;
  risk: "low" | "high";
};

export type Crew = {
  id: string;
  name: string;
  home: string;
  feeder_id: string;
  zone: string;
  assignment: string;
  trust: number;
};

export type FieldReport = {
  id: string;
  createdAt: string;
  crewId: string;
  feeder_id: string;
  zone: string;
  geo: string;
  summary: string;
  kind: "inventory" | "hazard" | "damage";
  risk: "low" | "high";
  status: "auto_published" | "held" | "approved" | "rejected";
  conflict?: string;
};

export type CopilotAnswer = {
  text: string;
  sources: { title: string; age: string; kind: string }[];
  confidence: number;
  escalate: boolean;
  local: boolean;
  blocked: boolean;
};

export type LinkMode = "online" | "degraded" | "offline";
