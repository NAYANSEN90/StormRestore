# Product Requirements Document (PRD): Storm Restoration Copilot

## 1. Executive Summary
The **Storm Restoration Copilot** is a voice-first, local-first AI system designed for electric utility field crews—specifically mutual-aid teams—operating in high-stress storm restoration environments. By leveraging **Moss** for local semantic search and on-device LLMs for reasoning, the system provides real-time, safety-gated access to the "Live Storm Picture" (outages, hazards, and assignments) without relying on constant cloud connectivity or burning excessive tokens.

## 2. Problem Statement
During major storm events, hundreds of crews (many unfamiliar with the local grid) struggle with:
*   **Information Latency:** Critical data reaches crews via congested radio channels or stale printouts.
*   **Safety Risks:** Crews may walk into hazards already reported by others but not yet propagated.
*   **Connectivity Gaps:** Standard cloud-based AI tools fail in areas with destroyed cellular infrastructure.
*   **Operational Inefficiency:** High "Mean Time to Resolve" (MTTR) due to repeat trips and manual datasheet/map lookups.

## 3. Goals & Objectives
*   **Reduce MTTR:** Target a 30% reduction in time-to-fix compared to manual processes.
*   **Local-First Reliability:** Ensure >95% of queries are answered locally on the device.
*   **Safety First:** Zero safety incidents attributable to AI misinformation; enforce strict "advisory-only" boundaries.
*   **Token Efficiency:** Minimize cloud costs by partitioning intelligence; only sync validated deltas.
*   **High Performance:** Achieve sub-1s end-to-end voice response latency.

## 4. Target Users / Stakeholders
*   **Line Crews:** Primary users requiring hands-free, voice-activated guidance.
*   **Mutual-Aid Crews:** External teams needing rapid orientation to local grid practices and hazards.
*   **Dispatchers:** Stakeholders who monitor the "Publish Gate" and approve high-risk field reports.
*   **Operations Managers:** Technical leads focused on fleet-wide restoration metrics and safety.

## 5. Functional Requirements

### 5.1 Voice-First Interface
*   **Hands-Free Operation:** Speech-to-Text (STT) and Text-to-Speech (TTS) for interaction while wearing gloves.
*   **Local Processing:** Audio processing must occur on-device to handle patchy coverage.

### 5.2 Local Knowledge Retrieval (RAG)
*   **Moss Knowledge Plane:** Sub-10ms hybrid search (semantic + keyword) over local documents, feeder maps, and safety bulletins.
*   **Source & Age Attribution:** Every answer must state the source (e.g., "Dispatcher Bulletin") and data age (e.g., "6 minutes old").

### 5.3 The Publish Gate (Triage & Route)
*   **Validation:** Schema and conflict checking against the Outage Management System (OMS).
*   **Risk-Based Routing:** 
    *   *Low-Risk:* Auto-publish to the fleet (e.g., inventory updates).
    *   *High-Risk:* Hold for Dispatcher approval (e.g., downed primary wires).
*   **Outcome-Weighted Trust:** Rank field reports based on the reporting crew's historical accuracy and firmware/equipment matches.

### 5.4 Safety Guardrails
*   **Advisory Only:** The system is forbidden from issuing switching orders or de-energizing lines.
*   **Verbatim Read-back:** Only read back official orders from the System of Record (OMS) without synthesis.
*   **Escalation:** Automatically route the user to a human dispatcher if confidence scores are low.

## 6. Non-Functional Requirements
*   **Performance:** Sub-10ms retrieval from Moss; <1s total voice-to-voice latency.
*   **Scalability:** Support sync spikes of 100–500 devices simultaneously via Moss Cloud Sync.
*   **Hardware:** Must run on standard field tablets/laptops (Target: 16GB RAM, modern NPU/GPU).
*   **Offline Capability:** 100% functional for retrieval and reasoning with zero cellular signal.

## 7. System Architecture Overview
The system is partitioned into two primary zones:
1.  **Crew Edge Device:** Contains the Voice Pipeline, Storm Supervisor (LangGraph), Moss Local Index, and a quantized Local LLM (Ollama).
2.  **Utility Control Center:** Houses the Utility Cloud Gateway, the Publish Gate, the OMS Connector, and the Dispatcher Console.

## 8. Tech Stack
*   **Local Search:** Moss (Hybrid Search + Cloud Sync).
*   **Local Inference:** Ollama (Llama-3-8B-Instruct-Q4).
*   **Orchestration:** Python, LangGraph (Supervisor), Pydantic (Validation).
*   **Voice:** Whisper.cpp (STT), Piper (TTS), LiveKit SDK.
*   **Backend/API:** FastAPI, gRPC, mTLS for secure transport.
*   **Frontend:** Next.js (Crew App & Dispatcher Console).
*   **Reranker:** Cross-Encoder (ms-marco-MiniLM-L-6-v2).

## 9. Data Requirements
*   **Document Types:** OMS events, hazard reports, damage assessments, safety bulletins, staging-yard inventory, and territory guides.
*   **Metadata Schema:** Every document must include `feeder_id`, `zone`, `geo_coords`, `timestamp`, `author_id`, and `confirmation_status`.
*   **Synthetic Data:** For initial phases, use a synthetic territory and grid model to protect utility IP.

## 10. API Specifications
*   **OMS Connector:** gRPC stream for live outage events.
*   **Publish Gate API:** Endpoint for field report submission with conflict-detection logic.
*   **Moss Sync:** Managed delta-updates via Moss Cloud to ensure local index freshness.

## 11. Security Requirements
*   **Authentication:** mTLS for all device-to-gateway communication.
*   **Data Privacy:** Sensitive datasheets and grid maps never leave the local device or the private "Small Cloud."
*   **Provenance:** Strict audit logging of every field report and AI-generated answer.

## 12. Deployment & Infrastructure
*   **Edge:** Containerized deployment (Docker) for local services (Ollama, Moss, Supervisor).
*   **Cloud:** Hardened FastAPI gateway deployed in a private utility cloud environment.
*   **Sync:** Moss Cloud Sync for managed distribution of the vector index.

## 13. Success Metrics
*   **MTTR Reduction:** 30% improvement over manual baseline.
*   **Local Resolution Rate:** >95% of queries answered without cloud fetch.
*   **Sync Latency:** P95 write-to-searchable latency < 30 seconds across the fleet.
*   **Safety:** Zero unauthorized switching instructions issued.

## 14. Timeline & Milestones
*   **Phase 0 (Week 1-2):** **Moss Benchmarking.** Measure sync latency and query recall. (Kill Decision Point).
*   **Phase 1 (Week 3):** **Ingestion Pipeline.** Build parsers for complex utility tables and diagrams.
*   **Phase 2 (Week 4-5):** **Local Reasoning.** Calibrate 4-bit vs 8-bit models and Reranker thresholds.
*   **Phase 3 (Week 6):** **Publish Gate & Supervisor.** Implement "Triage and Route" and safety boundaries.
*   **Phase 4 (Week 7-8):** **Field Pilot.** Shadow deployment with 5 crews during a simulated storm.

## 15. Open Questions & Risks
*   **Moss Sync Performance:** How does Moss Cloud Sync behave under a 500-device spike? (To be measured in Phase 0).
*   **Hardware Constraints:** Will 16GB RAM be sufficient for simultaneous Ollama, Moss, and Voice Pipeline execution?
*   **Conflict Resolution:** How to handle contradictory reports from two different crews at the same location? (Current strategy: Outcome-weighted trust).
*   **Safety Liability:** Ensuring the "Advisory Only" status is legally and operationally robust.