import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CREW } from "./corpus";
import { routeReport } from "./publish-gate";
import type { CopilotAnswer, FieldReport, LinkMode } from "./types";

export type ChatItem = {
  id: string;
  role: "crew" | "copilot";
  text: string;
  answer?: CopilotAnswer;
};

type StormState = {
  link: LinkMode;
  reports: FieldReport[];
  chat: ChatItem[];
  setLink: (link: LinkMode) => void;
  submitReport: (summary: string, kind: FieldReport["kind"]) => FieldReport;
  resolveReport: (id: string, status: "approved" | "rejected") => void;
  pushChat: (item: ChatItem) => void;
};

export const useStorm = create<StormState>()(
  persist(
    (set, get) => ({
      link: "degraded",
      reports: [],
      chat: [],
      setLink: (link) => set({ link }),
      submitReport: (summary, kind) => {
        const report = routeReport({
          crewId: CREW.id,
          feeder_id: CREW.feeder_id,
          zone: CREW.zone,
          geo: "34.412, -86.221",
          summary,
          kind,
        });
        set({ reports: [report, ...get().reports].slice(0, 40) });
        return report;
      },
      resolveReport: (id, status) =>
        set({
          reports: get().reports.map((r) => (r.id === id ? { ...r, status } : r)),
        }),
      pushChat: (item) => set({ chat: [...get().chat, item].slice(-40) }),
    }),
    { name: "storm-copilot-v1" },
  ),
);
