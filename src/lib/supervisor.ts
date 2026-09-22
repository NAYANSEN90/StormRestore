import { createServerFn } from "@tanstack/react-start";
import { CREW } from "./corpus";
import { mossSearch, type MossHit } from "./moss";
import { isUnsafeRequest, SAFETY_REFUSAL } from "./safety";
import type { CopilotAnswer } from "./types";

function hitsToSources(hits: MossHit[]): CopilotAnswer["sources"] {
  return hits.slice(0, 3).map((h) => ({ title: h.title, age: h.age, kind: h.kind }));
}

function localAnswer(query: string, hits: MossHit[]): CopilotAnswer | null {
  const q = query.toLowerCase();
  if (/\b(assignment|what(?:'s| is) my job|where do i (?:go|work))\b/.test(q)) {
    return {
      text: `Assignment for ${CREW.name}: ${CREW.assignment} Source: dispatcher packet. Advisory only.`,
      sources: [{ title: "Crew assignment packet", age: "issued this shift", kind: "guide" }],
      confidence: 0.96,
      escalate: false,
      local: true,
      blocked: false,
    };
  }
  if (hits.length && (/\b(hazard|downed|wire|gas|outage|inventory|yard|feeder|order)\b/.test(q) || hits[0].score >= 4)) {
    const top = hits[0];
    const extra = hits.slice(1, 3).map((h) => `${h.title} (${h.age})`).join("; ");
    return {
      text: `${top.title}. ${top.body} Source: ${top.title}, ${top.age}, ${top.confirmation_status}. ${extra ? `Also: ${extra}.` : ""} Advisory only — not a switching order.`,
      sources: hitsToSources(hits),
      confidence: Math.min(0.93, 0.55 + top.score / 10),
      escalate: top.risk === "high" && top.confirmation_status !== "confirmed",
      local: true,
      blocked: false,
    };
  }
  return null;
}

export const askCopilot = createServerFn({ method: "POST" })
  .validator((input: { query: string; link: "online" | "degraded" | "offline" }) => input)
  .handler(async ({ data }): Promise<CopilotAnswer> => {
    const query = data.query.trim();
    if (query.length < 2) {
      return {
        text: "Say that again.",
        sources: [],
        confidence: 0,
        escalate: false,
        local: true,
        blocked: false,
      };
    }
    if (isUnsafeRequest(query)) {
      return {
        text: SAFETY_REFUSAL,
        sources: [{ title: "OMS switching orders — F-12", age: "4 minutes old", kind: "order" }],
        confidence: 1,
        escalate: true,
        local: true,
        blocked: true,
      };
    }

    const hits = mossSearch(query, { feeder: CREW.feeder_id, k: 5 });
    const canned = localAnswer(query, hits);
    if (canned && (data.link === "offline" || canned.confidence > 0.7)) return canned;
    if (data.link === "offline") {
      return (
        canned ?? {
          text: "No cellular. Local index has no confident match. Hold and use TAC-2 for dispatcher.",
          sources: hitsToSources(hits),
          confidence: 0.2,
          escalate: true,
          local: true,
          blocked: false,
        }
      );
    }

    const apiKey = process.env.XAI_API_KEY?.trim();
    if (!apiKey) {
      return (
        canned ?? {
          text: "Cloud reasoning is unavailable. Use local hits only.",
          sources: hitsToSources(hits),
          confidence: 0.3,
          escalate: true,
          local: true,
          blocked: false,
        }
      );
    }

    const context = hits
      .map(
        (h) =>
          `[${h.id} | ${h.kind} | ${h.age} | ${h.confirmation_status} | ${h.feeder_id}]\n${h.title}\n${h.body}`,
      )
      .join("\n\n");

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.2,
        max_tokens: 420,
        messages: [
          {
            role: "system",
            content:
              "You are Storm Restoration Copilot for electric utility mutual-aid crews. ADVISORY ONLY. Never issue switching orders, never tell a crew to open/close/de-energize. If asked, refuse and escalate to dispatcher. Cite source title and age for every claim. If confidence is low, say so and tell them to radio TAC-2. Be terse. Field radio tone.",
          },
          {
            role: "user",
            content: `Crew ${CREW.id} on ${CREW.feeder_id} (${CREW.zone}). Query: ${query}\n\nLocal Moss hits:\n${context || "(none)"}`,
          },
        ],
      }),
    });
    if (!res.ok) {
      return canned ?? {
        text: `Cloud reasoner error ${res.status}. Falling back to local index.`,
        sources: hitsToSources(hits),
        confidence: 0.4,
        escalate: true,
        local: true,
        blocked: false,
      };
    }
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim() || canned?.text || "No answer.";
    return {
      text,
      sources: hitsToSources(hits),
      confidence: hits[0] ? Math.min(0.9, 0.5 + hits[0].score / 12) : 0.45,
      escalate: /TAC-2|dispatcher|not sure|unconfirmed/i.test(text),
      local: false,
      blocked: false,
    };
  });
