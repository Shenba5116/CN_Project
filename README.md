# NetResQ: An Adaptive Self-Healing Network Using Quality-Aware Routing

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![NetworkX](https://img.shields.io/badge/NetworkX-3.2+-orange)](https://networkx.org)
[![Pytest](https://img.shields.io/badge/Pytest-8.0+-0A9EDC?logo=pytest)](https://pytest.org)

**NetResQ** is a full-stack, college-level computer networks project demonstrating **dynamic self-healing routing** and **quality-aware path selection** at **OSI Layer 3**.

Traditional routing algorithms (like standard Dijkstra in OSPF) route traffic strictly based on static hop counts or fixed administrative costs. When an active link experiences severe packet loss, latency degradation, or buffer saturation, conventional protocols continue forwarding packets over the impaired path until it crashes completely.

NetResQ addresses this limitation by introducing a **multi-metric quality-aware cost function** combined with **automatic link-failure detection and real-time rerouting**.

---

## 1. Problem Statement & Project Objectives

### Problem Statement:
Modern networks suffer from transient congestion, bufferbloat, and intermittent link degradation that do not cause total hardware link loss. Static shortest-path algorithms cannot detect or adapt to these quality degradations, leading to high packet loss, increased jitter, and degraded application performance.

### Key Objectives:
1. **Dynamic Self-Healing:** Automatically detect link failures and compute optimal alternate paths in real time.
2. **Quality-Aware Routing:** Balance hop count against real-time network telemetry (latency, packet loss, bandwidth utilization).
3. **Rigorous Comparison:** Objectively compare standard Dijkstra routing with Quality-Aware routing under identical network conditions.
4. **Interactive Operations Dashboard:** Provide network operators with visual topology monitoring, failure injection controls, telemetry charts, and an audit event stream.
5. **Architectural Separation:** Support both an **independent standalone simulation mode** (runnable anywhere) and an **emulated OpenFlow 1.3 SDN controller mode** (via Mininet and Ryu).

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Vanilla CSS design tokens, Lucide React icons.
- **Backend:** Python 3.12, FastAPI, Uvicorn, NetworkX, Pydantic.
- **Testing:** Pytest (automated unit and API endpoint testing).
- **SDN Emulation (Optional):** Mininet, Open vSwitch (OVS), Ryu SDN Controller (OpenFlow 1.3).

---

## 3. High-Level Architecture

```
[ Operator / Browser (React 19 Dashboard) ]
                | (HTTP / REST JSON)
[ FastAPI Backend Engine (Port 8000) ]
       |-- Graph Model: NetworkX
       |-- Algorithms: Baseline Dijkstra vs. Quality-Aware Routing
       |-- Adapters:
             |--> SimulationAdapter (Authoritative In-Memory Topology)
             |--> SDNControllerAdapter (Optional Ryu OpenFlow 1.3 REST)
```

The system separates presentation from graph state. The backend serves as the single source of truth for topology and calculated paths.

---

## 4. Quality-Aware Routing Formula

To prevent dimensional distortion when adding milliseconds, percentages, and costs, all metrics are normalized into a dimensionless range $[0, 1]$:

$$ \text{norm\_latency} = \frac{\text{latency\_ms}}{\text{latency\_reference\_ms}} \quad (\text{default reference} = 50.0\text{ms}) $$
$$ \text{norm\_loss} = \frac{\text{packet\_loss\_percent}}{100.0} $$
$$ \text{norm\_utilization} = \frac{\text{utilization\_percent}}{100.0} $$

The composite edge cost is calculated as:
$$ \text{link\_cost} = w_{\text{cost}} \cdot C + w_{\text{latency}} \cdot \text{norm\_latency} + w_{\text{loss}} \cdot \text{norm\_loss} + w_{\text{util}} \cdot \text{norm\_util} $$

### Default Weights:
- $w_{\text{cost}} = 1.0$ (Administrative hop weight)
- $w_{\text{latency}} = 1.0$ (Delay penalty)
- $w_{\text{loss}} = 2.0$ (Packet drop penalty)
- $w_{\text{util}} = 1.5$ (Congestion avoidance penalty)

Since all weights and metrics are non-negative, **Dijkstra's greedy shortest-path algorithm is mathematically guaranteed to find the global optimal lowest-cost path**.

---

## 5. Project Directory Structure

```
CN_Project/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entrypoint
│   │   ├── config.py                # Network parameters, defaults, and CORS
│   │   ├── models.py                # Pydantic schemas (Node, Link, Route, Metrics)
│   │   ├── api/
│   │   │   └── routes.py            # REST API endpoints
│   │   ├── services/
│   │   │   ├── topology_service.py  # Coordinates active network adapter
│   │   │   ├── routing_service.py   # Computes & compares routing algorithms
│   │   │   ├── metrics_service.py   # Telemetry aggregation & time-series
│   │   │   ├── simulation_service.py# Failures, restorations, failover timing
│   │   │   ├── event_service.py     # In-memory operational event stream
│   │   │   └── controller_service.py# SDN controller connection monitoring
│   │   ├── algorithms/
│   │   │   ├── shortest_path.py     # Baseline Dijkstra algorithm
│   │   │   └── quality_aware.py     # Quality-Aware composite cost algorithm
│   │   ├── adapters/
│   │   │   ├── base.py              # Abstract network interface
│   │   │   ├── simulation_adapter.py# In-memory virtual topology
│   │   │   ├── sdn_controller_adapter.py # Ryu REST API adapter
│   │   │   └── mininet_adapter.py   # Mininet generator helper
│   │   └── tests/
│   │       ├── test_shortest_path.py
│   │       ├── test_quality_aware.py
│   │       ├── test_failures.py
│   │       └── test_api.py
│   ├── requirements.txt
│   └── venv/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx           # Status, endpoint selectors, algorithm toggle
│   │   │   ├── MetricCards.tsx      # Overview cards & telemetry gauges
│   │   │   ├── TopologyView.tsx     # Interactive SVG triangle graph & link inspector
│   │   │   ├── RoutingComparison.tsx# Side-by-side comparison & hop breakdown
│   │   │   ├── EventLogView.tsx     # Chronological failover audit log
│   │   │   ├── SettingsView.tsx     # Dynamic weight sliders & SDN settings
│   │   │   └── PerformanceCharts.tsx# Telemetry trend & comparison bar charts
│   │   ├── services/
│   │   │   └── api.ts               # Typed fetch REST API client
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   ├── App.tsx                  # Main layout with tab navigation
│   │   ├── main.tsx
│   │   └── index.css                # Professional operations dashboard theme
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── docs/
│   ├── architecture.md              # Architecture & Mermaid diagrams
│   ├── algorithm_explanation.md     # Formulas & worked numerical examples
│   ├── testing_guide.md             # Automated test suite & verification steps
│   └── viva_questions.md            # Comprehensive project evaluation Q&A
├── scripts/
│   ├── start_backend.bat            # Windows startup script for backend
│   ├── start_backend.sh             # Linux startup script for backend
│   ├── start_frontend.bat           # Windows startup script for frontend
│   ├── start_frontend.sh            # Linux startup script for frontend
│   ├── mininet_topology.py          # Mininet OpenFlow 1.3 triangle script
│   └── ryu_controller.py            # Ryu OpenFlow 1.3 controller app
├── .gitignore
└── README.md
```

---

## 6. Quick Start & Execution Guide

### Prerequisites
- Python 3.10+ (tested with Python 3.12)
- Node.js 18+ (tested with Node.js 24)

### Starting the Backend
From the root directory:
```bash
# On Windows PowerShell:
.\scripts\start_backend.bat

# Or manually:
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend will be live at: `http://127.0.0.1:8000`  
Interactive Swagger API documentation: `http://127.0.0.1:8000/docs`

### Starting the Frontend
In a second terminal:
```bash
# On Windows PowerShell:
.\scripts\start_frontend.bat

# Or manually:
cd frontend
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 7. Running the Automated Test Suite

From the project root:
```bash
# Run all 20 automated tests:
.\backend\venv\Scripts\pytest.exe -v
```
All 20 tests pass with 100% success rate:
- Baseline Dijkstra path computation and disconnected topologies
- Quality-Aware cost formulas, weight sensitivities, and degradation avoidance
- Link failure failover benchmarks and restoration stability
- FastAPI REST endpoints, status responses, and validation error handling

---

## 8. Manual Demonstration Walkthrough

1. **Initial Clean State:**
   - Source is `H1` and destination is `H4`.
   - The active path is `H1 -> S1 -> S3 -> H4` (3 hops, lowest cost).
   - All 7 links are green (Healthy UP).
2. **Inject Simulated Link Failure:**
   - Click core link `L_S1_S3` on the interactive topology.
   - Click **"Fail Link"**.
   - Observe `L_S1_S3` turn red-dashed.
   - The self-healing engine immediately detects the failure and reroutes traffic via `S2`: `H1 -> S1 -> S2 -> S3 -> H4`.
   - The route computation time (~1.0ms) is displayed in the metric card and recorded in the Event Log.
3. **Restore Failed Link:**
   - In the link inspector, click **"Restore Link"**.
   - Link restores to green, and the path returns to `S1 -> S3`.
4. **Demonstrate Quality-Aware Routing Under Congestion:**
   - Click **"Demo Congestion"** in the top navigation bar.
   - Injects 65ms latency and 18% packet loss on `L_S1_S3`.
   - Baseline Dijkstra continues sending traffic across `S1 -> S3` because its hop count is smaller (3 hops).
   - Quality-Aware routing evaluates the high delay and loss penalty and **automatically chooses the 4-hop route via S2** (`H1 -> S1 -> S2 -> S3 -> H4`) because its composite cost is lower!
5. **Inspect the Comparison:**
   - Click the **"Routing Analysis & Proof"** tab to view side-by-side comparison tables, bar charts, and mathematical hop breakdowns.
6. **Reset Scenario:**
   - Click **"Reset Scenario"** to restore clean baseline conditions.

---

## 9. References & Acknowledgments

- **SDN Controller Reference:** [ascjreddy/sdn-controller](https://github.com/ascjreddy/sdn-controller) (Informed LLDP discovery concepts and Dijkstra graph routing principles).
- **Self-Healing SDN Reference:** [Srizzye/Self-Healing-Software-Defined-Networks](https://github.com/Srizzye/Self-Healing-Software-Defined-Networks) (Informed dynamic failover and static vs. adaptive routing comparison).
- **Mininet Documentation:** [Mininet Walkthrough](https://mininet.org/walkthrough/)
- **Ryu SDN Framework:** [Ryu Documentation](https://ryu.readthedocs.io/)
