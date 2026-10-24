# NetResQ — 4-Member Project Presentation & Viva Defense Split

This document assigns specific technical responsibilities, speaking scripts, demo actions, and viva defense answers for a **4-member project team**.

---

```
                                  [ PROJECT FLOW ]
 Member 1: Background & SDN Architecture  -->  Member 2: Routing Algorithm & Math
                                                      |
 Member 4: Live Demo, Dashboard & Mininet <--  Member 3: Self-Healing Engine & API
```

---

## 👤 MEMBER 1: Project Lead & Network Architecture Specialist

### 1. Presentation Topic:
- **Title:** Problem Statement, SDN Philosophy, and End-to-End System Architecture.
- **Duration:** ~2.5 to 3 Minutes.

### 2. Core Concepts to Explain:
1. **The Problem:** In conventional networks (OSPF/RIP), routing protocols blindly follow static hop counts. If an intermediate link experiences 65ms latency and 20% packet loss, standard Dijkstra still sends packets through it because its configured cost is static.
2. **The Solution (NetResQ):** An adaptive self-healing network operating at **OSI Layer 3** that dynamically detects quality degradation and link failures.
3. **Software-Defined Networking (SDN):**
   - **Control Plane:** Centralized intelligence (FastAPI + NetworkX).
   - **Data Plane:** Packet forwarding switches (OpenFlow 1.3 switches).
4. **Topology Structure:** Deterministic 3-switch triangle core (`S1`, `S2`, `S3`) with 4 attached hosts (`H1`, `H2` on `S1`; `H3` on `S2`; `H4` on `S3`).

### 3. Files to Open & Reference:
- `README.md`: Project overview and problem statement.
- `docs/architecture.md`: Architecture diagrams and component flow.
- `backend/app/config.py`: Topology definition (`DEFAULT_NODES` and `DEFAULT_LINKS`).

### 4. Actions on Live Dashboard:
- Open `http://localhost:5173`.
- Point to the persistent header: Highlight "NetResQ", the green **"BACKEND LIVE"** badge, and **"SIMULATION MODE"**.
- Explain the 4 metric cards on the Overview tab (Switches Online: 3, Total Links: 7, 0 Failures, Health Score: 100%).

### 5. Speaking Script / Pitch:
> *"Good morning, respected evaluators. I am [Name], presenting the architecture and problem statement of NetResQ. In traditional enterprise and telecom networks, routing protocols like OSPF calculate paths using static administrative hop costs. When an intermediate link experiences bufferbloat or severe packet drops without a physical cable cut, standard routing is completely blind to it. NetResQ solves this by introducing dynamic telemetry and self-healing at OSI Layer 3. We use an SDN architecture where our FastAPI control plane maintains an authoritative NetworkX graph model. Let me hand over to [Member 2] to explain the mathematical routing algorithm."*

### 6. Likely Viva Questions for Member 1:
- **Q: Which OSI layer does this project operate at?**  
  *Answer:* OSI Layer 3 (Network Layer), responsible for end-to-end path determination and forwarding decisions.
- **Q: What is the separation of planes in SDN?**  
  *Answer:* Decoupling the decision-making logic (Control Plane) from the underlying hardware/virtual packet forwarding mechanisms (Data Plane).

---

## 👤 MEMBER 2: Routing Algorithms & Mathematical Optimization Lead

### 1. Presentation Topic:
- **Title:** Multi-Metric Normalization, Composite Cost Function, and Proof of Dijkstra Correctness.
- **Duration:** ~3 Minutes.

### 2. Core Concepts to Explain:
1. **Why Normalization is Mandatory:** You cannot directly add milliseconds (e.g. 60ms) and percentages (e.g. 18%) to administrative costs without skewing. NetResQ normalizes each into a dimensionless $[0, 1]$ scale.
2. **The Normalization Formulas:**
   $$\text{norm\_latency} = \frac{\text{latency\_ms}}{\text{ref\_ms}} \quad (\text{ref} = 50.0\text{ms}), \quad \text{norm\_loss} = \frac{\text{loss}\%}{100}, \quad \text{norm\_util} = \frac{\text{util}\%}{100}$$
3. **The Composite Edge Cost Formula:**
   $$\text{link\_cost} = (w_{\text{cost}} \cdot C) + (w_{\text{lat}} \cdot \text{norm\_lat}) + (w_{\text{loss}} \cdot \text{norm\_loss}) + (w_{\text{util}} \cdot \text{norm\_util})$$
4. **Mathematical Guarantee for Dijkstra:** Dijkstra requires non-negative weights ($w \ge 0$). Because all physical metrics $\ge 0$ and weights $\ge 0$, we enforce $\text{MIN\_EDGE\_COST} = 0.001$. This guarantees global optimality without negative cycle bugs.
5. **Numerical Proof:**
   - Path A (Direct `H1-S1-S3-H4`): 3 hops, 67ms latency, 18% loss $\to \mathbf{\text{Cost} = 6.12}$.
   - Path B (Detour `H1-S1-S2-S3-H4`): 4 hops, 13ms latency, 0% loss $\to \mathbf{\text{Cost} = 4.79}$.
   - Result: Quality-Aware chooses Path B because $4.79 < 6.12$.

### 3. Files to Open & Reference:
- `backend/app/algorithms/quality_aware.py`: `calculate_link_cost()` and `compute_quality_aware_path()`.
- `backend/app/algorithms/shortest_path.py`: Baseline Dijkstra algorithm.
- `docs/algorithm_explanation.md`: Numerical proof and formulas.

### 4. Actions on Live Dashboard:
- Click on the **"Routing Analysis & Proof"** tab.
- Walk the evaluator through the side-by-side comparison cards:
  - Baseline Dijkstra: 3 hops, Admin cost: 3.0.
  - Quality-Aware: 4 hops, Composite cost: 4.79.
- Point to the **"Active Path Hop Breakdown Table"** showing per-link latency and calculated edge cost.

### 5. Speaking Script / Pitch:
> *"I am [Name], and I will explain the mathematical core of NetResQ. To overcome static hop counting, we developed a multi-metric composite cost function. Because milliseconds and percentages have incompatible units, we first normalize latency against a 50ms reference, and loss and utilization into decimals between 0 and 1. We weight packet loss higher at 2.0 to aggressively penalize drop-prone links. Crucially, because all edge costs are strictly positive (&ge; 0.001), Dijkstra's greedy algorithm is mathematically guaranteed to find the globally optimal path. As seen on our comparison panel, when the direct link degrades, our formula proves that a 4-hop clean path has a lower composite cost (4.79) than a degraded 3-hop path (6.12). I will now pass to [Member 3] to show how the self-healing failover engine operates in code."*

### 6. Likely Viva Questions for Member 2:
- **Q: Why can't you use Bellman-Ford instead of Dijkstra?**  
  *Answer:* Bellman-Ford has $O(V \cdot E)$ complexity compared to Dijkstra's $O(E + V \log V)$. Bellman-Ford is only required if edge weights can be negative. Since our normalized costs are strictly positive, Dijkstra is significantly faster and optimal.
- **Q: What happens if two paths have the exact same cost?**  
  *Answer:* NetworkX uses deterministic node identifier sorting as a tie-breaker.

---

## 👤 MEMBER 3: Self-Healing Engine, Backend API & Failover Specialist

### 1. Presentation Topic:
- **Title:** Failure Detection, Automated Failover Rerouting, Monotonic Benchmarking, and FastAPI REST Services.
- **Duration:** ~3 Minutes.

### 2. Core Concepts to Explain:
1. **Dynamic Link Failure Handling:**
   - Link is marked `DOWN` in the authoritative `SimulationAdapter`.
   - Graph construction filters out failed links: `if link.status == 'down': continue`.
   - Dijkstra recomputes over surviving edges in **sub-millisecond time (~0.48ms)**.
2. **Monotonic Clock Benchmarking:** Uses `time.perf_counter()` to record software route recomputation time without clock skew.
3. **Network Partition Handling:** When a destination is completely cut off, `nx.has_path()` returns `False`. The API returns a clean `"no_path"` status without crashing.
4. **FastAPI Endpoints:**
   - `GET /api/topology`: Current nodes & links state.
   - `POST /api/links/{id}/fail` & `restore`: Failure and self-healing endpoints.
   - `POST /api/routes/compute`: Real-time path re-evaluation.
   - `GET /api/events`: Reverse-chronological audit log.

### 3. Files to Open & Reference:
- `backend/app/services/simulation_service.py`: `fail_link()` and `restore_link()`.
- `backend/app/api/routes.py`: REST route handlers and Pydantic validation.
- `backend/app/tests/test_failures.py`: Automated unit tests proving failover stability.

### 4. Actions on Live Dashboard:
- Switch to the **"Network Topology & Control"** tab.
- Click on core link `L_S1_S3` on the diagram.
- Click the red **"Fail Link"** button!
- Show the link turning red-dashed and the active route instantly switching to `H1 -> S1 -> S2 -> S3 -> H4`.
- Point out the **"Route Recalc: 0.48ms"** badge.
- Open the **"Operational Events"** tab to show the recorded `LINK_FAILURE` warning event with timestamp and UUID.
- Go back to the topology and click **"Restore Link"** to show immediate recovery.

### 5. Speaking Script / Pitch:
> *"I am [Name], in charge of the self-healing failover engine and backend services. Our backend is built on FastAPI and Uvicorn. When a link fails, our SimulationService immediately excludes that edge from the NetworkX graph. Notice on our screen: as I click 'Fail Link' on L_S1_S3, the topology instantly turns red-dashed, and our self-healing engine detects the loss, recalculates the path through S2, and restores connectivity in just 0.48 milliseconds. We measure this software execution time using Python's monotonic clock. If a network partition occurs where no route exists, our API returns a structured 'no_path' response rather than failing. I now hand over to [Member 4] to demonstrate congestion scenarios and our SDN emulation."*

### 6. Likely Viva Questions for Member 3:
- **Q: What is the difference between software route computation time and physical network recovery time?**  
  *Answer:* Software calculation time (~0.5ms) is the CPU time to prune the graph and run Dijkstra. Physical recovery time in hardware includes optical/copper carrier loss detection and OpenFlow `OFPFlowMod` rule installation, typically taking 20ms to 100ms.
- **Q: How do you prevent graph corruption during repeated link flapping?**  
  *Answer:* Links are stored with unique immutable IDs (`L_S1_S2`). Failure updates an enum status (`UP`/`DOWN`) rather than deleting objects from memory, ensuring idempotent state transitions.

---

## 👤 MEMBER 4: Frontend UI/UX, Live Demo Orchestrator & SDN Emulation Lead

### 1. Presentation Topic:
- **Title:** Operations Dashboard Engineering, Live Congestion Injection, Real-Time Telemetry, and Mininet/Ryu SDN Integration.
- **Duration:** ~3 Minutes.

### 2. Core Concepts to Explain:
1. **Frontend Architecture:** Built with React 19, TypeScript, and Vite. Features custom responsive SVG canvas rendering for nodes and edges, eliminating heavy bloated chart dependencies.
2. **Real-Time Telemetry & Visual State:**
   - Active route glows neon cyan with animated flowing dash offset (`@keyframes dash-flow`).
   - Links show green (healthy), amber (degraded), or red (failed).
3. **Live Demonstration of Congestion:**
   - Click **"Demo Congestion"** to inject 65ms latency and 18% packet loss on `L_S1_S3`.
   - Show how Quality-Aware routing automatically detours via `S2`, while baseline Dijkstra stays trapped on the congested link.
4. **Dynamic Weight Tuning:** Use sliders on the Settings tab to adjust the packet loss weight or latency reference, showing live recalculation.
5. **Real SDN Emulation (Mininet + Ryu):**
   - Explain how NetResQ can connect to an external **Ryu OpenFlow 1.3 Controller** on Linux/WSL.
   - Explain `scripts/mininet_topology.py` and `scripts/ryu_controller.py`.

### 3. Files to Open & Reference:
- `frontend/src/components/TopologyView.tsx`: SVG canvas with animated packet flow.
- `frontend/src/components/SettingsView.tsx`: Live weight sliders and formula preview.
- `scripts/mininet_topology.py`: Mininet OpenFlow 1.3 topology script.
- `scripts/ryu_controller.py`: Standalone Ryu controller application.

### 4. Actions on Live Dashboard:
- Click the amber **"Demo Congestion"** button in the header.
- Point to `L_S1_S3` showing degraded metrics (`65ms | 18%`).
- Show the animated cyan active route bypassing `L_S1_S3` and flowing through `S1 -> S2 -> S3`.
- Navigate to the **"Settings & Weights"** tab:
  - Drag the **Packet Loss Weight** slider from 2.0 to 0.0 to demonstrate how changing administrative policy affects path selection.
- Click **"Reset Scenario"** to restore clean baseline conditions.

### 5. Speaking Script / Pitch:
> *"I am [Name], and I lead the dashboard engineering and SDN integration. Our UI is built in React 19 and TypeScript, designed to resemble a carrier-grade Network Operations Center (NOC). The topology you see is rendered as an interactive vector SVG, where the active route is highlighted with animated flowing packets. Now, let me demonstrate our primary test scenario: I will click 'Demo Congestion'. This injects 65ms latency and 18% packet loss on direct link L_S1_S3. Watch the active route: baseline Dijkstra remains trapped on the congested link because it only counts hops, but NetResQ dynamically switches to the 4-hop route via S2 to safeguard throughput and latency. Additionally, NetResQ includes Mininet and Ryu controller integration scripts for Ubuntu and WSL2 environments. This concludes our presentation, and we are ready for your questions."*

### 6. Likely Viva Questions for Member 4:
- **Q: How does LLDP discovery work in an SDN controller like Ryu?**  
  *Answer:* The controller sends LLDP (Link Layer Discovery Protocol) packet-out messages to all switch ports. When neighbor switches forward the packet-in back to the controller, the controller maps the adjacency between switch datapath IDs and port numbers.
- **Q: How does the frontend stay synchronized with the backend?**  
  *Answer:* The frontend polls the `/api/status`, `/api/topology`, and `/api/metrics` endpoints every 3 seconds, updating React state hooks with fresh telemetry and graph attributes.

---

## 📋 Summary Table for Quick Reference

| Team Member | Core Focus | Key Code File | Key Live Action on Dashboard |
| :--- | :--- | :--- | :--- |
| **Member 1** | Background, SDN Philosophy, OSI Layer 3 | `backend/app/config.py` | Overview cards, Header badges, Topology intro |
| **Member 2** | Normalization, Composite Cost Math, Dijkstra Proof | `backend/app/algorithms/quality_aware.py` | Routing Analysis tab, Hop breakdown table |
| **Member 3** | Self-Healing Failover, Monotonic Benchmark, API | `backend/app/services/simulation_service.py` | Fail Link button, 0.48ms recalc badge, Event Log |
| **Member 4** | React 19 UI, Demo Congestion, Settings & Ryu/Mininet | `frontend/src/components/TopologyView.tsx` | Demo Congestion button, Weight sliders, Reset |
