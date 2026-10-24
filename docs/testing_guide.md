# NetResQ Testing Guide

This document details how to run the automated test suite and execute manual verification scenarios during project demonstration.

---

## 1. Automated Test Suite (Pytest)

NetResQ includes automated unit and integration tests covering graph modeling, Dijkstra baseline, Quality-Aware routing, failovers, and REST API endpoints.

### Running Backend Tests:
From the root directory:
```bash
# On Windows PowerShell:
.\backend\venv\Scripts\pytest.exe -v

# On Linux / WSL:
pytest -v
```

### Test Suite Structure:
- `backend/app/tests/test_shortest_path.py`:
  - `test_baseline_shortest_path_healthy`: Verifies direct Dijkstra route.
  - `test_baseline_direct_neighbors`: Verifies single-hop switch routing.
  - `test_baseline_excludes_failed_link`: Tests that failed links are never selected.
  - `test_baseline_disconnected_partition`: Verifies graceful `"no_path"` result.
  - `test_baseline_invalid_nodes`: Validates error response for bad node IDs.

- `backend/app/tests/test_quality_aware.py`:
  - `test_link_cost_formula`: Validates mathematical computation of composite edge cost.
  - `test_quality_aware_prefers_healthy_alternate_path`: Proves algorithm chooses healthy 4-hop route over degraded 3-hop route.
  - `test_quality_aware_excludes_down_link`: Confirms down links are omitted.
  - `test_weight_sensitivity`: Verifies that tuning weights alters routing policy.

- `backend/app/tests/test_failures.py`:
  - `test_link_failure_and_failover`: Tests simulated link failure and automatic rerouting.
  - `test_link_restoration`: Tests restoring link back to healthy status.
  - `test_repeated_failures_do_not_corrupt_graph`: Verifies graph consistency under repeated churn.
  - `test_network_partition_handling`: Verifies partition handling when destination is isolated.

- `backend/app/tests/test_api.py`:
  - `test_api_health`: Tests `/api/health`.
  - `test_api_status`: Tests `/api/status`.
  - `test_api_topology`: Tests `/api/topology`.
  - `test_api_compute_route`: Tests `/api/routes/compute`.
  - `test_api_link_failure_and_restoration`: Tests POST failure and restore endpoints.
  - `test_api_invalid_link_id`: Tests 400 validation for bogus IDs.
  - `test_api_weights`: Tests reading and updating weighting coefficients.

---

## 2. Step-by-Step Manual Demonstration Checklist

Follow this checklist during an evaluation or viva presentation:

| Step | Action | Expected Observation |
| :--- | :--- | :--- |
| **1. Initial Health** | Open `http://localhost:5173`. Select route `H1 -> H4`. | Default path is `H1 -> S1 -> S3 -> H4` (3 hops). All 7 links are green (UP). |
| **2. Trigger Link Failure** | Click core link `L_S1_S3` on the topology canvas and click **"Fail Link"**. | Link `L_S1_S3` turns red-dashed. An event appears in the Event Log. Active route immediately reroutes to `H1 -> S1 -> S2 -> S3 -> H4`. |
| **3. Restore Link** | In the inspector panel for `L_S1_S3`, click **"Restore Link"**. | Link turns green (UP). Event log records restoration. Route returns to `H1 -> S1 -> S3 -> H4`. |
| **4. Inject Congestion** | Click the **"Demo Congestion"** button in the header. | Injects 65ms latency and 18% loss on `L_S1_S3`. Link turns amber. Quality-aware algorithm automatically routes via `S1 -> S2 -> S3` to protect quality! |
| **5. Routing Comparison** | Navigate to the **"Routing Analysis & Proof"** tab. | Baseline Dijkstra still prefers congested link (hop count 3), while Quality-Aware chooses clean path (lower composite cost). |
| **6. Weight Adjustment** | Go to **"Weights & SDN Settings"** tab. Adjust Loss Weight slider. | Instant formula update and live path re-evaluation. |
| **7. Reset Demo** | Click **"Reset Scenario"** in the top navigation. | Topology, link metrics, and routes restore to initial healthy baseline. |
