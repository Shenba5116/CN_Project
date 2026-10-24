# NetResQ Viva & Project Evaluation Q&A Guide

This guide prepares students to explain NetResQ with confidence during college evaluations, project reviews, and viva voce exams.

---

### Q1: What is NetResQ and what problem does it solve?
**Answer:**
NetResQ (**Network Rescue**) is an adaptive, self-healing network routing system operating at **OSI Layer 3**. Conventional routing protocols (like OSPF or RIP) compute shortest paths using static metrics such as hop counts or fixed administrative weights. They cannot dynamically respond when an intermediate link experiences severe latency spikes, buffer congestion, or high packet loss. NetResQ solves this by continuously monitoring link health and dynamically routing traffic over alternate paths using a multi-metric quality-aware cost formula.

---

### Q2: What is Software-Defined Networking (SDN) and how does it relate to NetResQ?
**Answer:**
SDN separates the **Control Plane** (the logic deciding where packets are sent) from the **Data Plane** (the underlying hardware or virtual switches forwarding packets).
In NetResQ:
- The **Control Plane** logic resides in our backend routing engine (FastAPI + NetworkX or Ryu Controller).
- The **Data Plane** consists of OpenFlow 1.3 switches (simulated in our virtual graph or emulated via Open vSwitch in Mininet).
- The controller maintains a global view of network topology and computes optimal paths centrally rather than relying on distributed, slow-converging routers.

---

### Q3: Why does traditional Dijkstra routing fail under link degradation?
**Answer:**
Traditional Dijkstra computes the path minimizing $\sum \text{hop\_cost}$. Because hop costs are configured administrative constants (e.g., 1.0 per link), a link's cost remains 1.0 even if it suffers 80ms latency and 20% packet drops. Consequently, traffic continues to be forwarded across the degraded link, causing application timeouts and TCP retransmissions.

---

### Q4: Explain the Quality-Aware Edge Cost Formula and why normalization is necessary.
**Answer:**
We cannot directly add milliseconds (e.g., 60ms), percentages (e.g., 15%), and administrative units without distorting their physical impact. Therefore, we normalize every metric into a dimensionless $[0, 1]$ scale:
1. $\text{norm\_latency} = \frac{\text{latency\_ms}}{\text{latency\_reference\_ms}}$ (default reference: 50ms)
2. $\text{norm\_loss} = \frac{\text{packet\_loss\_percent}}{100.0}$
3. $\text{norm\_utilization} = \frac{\text{utilization\_percent}}{100.0}$

The composite cost is calculated as:
$$ \text{Cost}(e) = w_{\text{cost}} \cdot C + w_{\text{latency}} \cdot \text{norm\_latency} + w_{\text{loss}} \cdot \text{norm\_loss} + w_{\text{util}} \cdot \text{norm\_util} $$
This allows network administrators to tune priorities (e.g., weighting packet loss higher than latency for critical transactional data).

---

### Q5: Can Dijkstra's algorithm still be used with your quality-aware formula?
**Answer:**
**Yes, absolutely.** Dijkstra's algorithm requires that all edge weights be strictly **non-negative** ($w \ge 0$). Because our metrics (latency, loss, utilization) and weights are all non-negative, and we enforce a floor of $\text{MIN\_EDGE\_COST} = 0.001$, no negative edges or cycles can ever occur. Therefore, Dijkstra's algorithm is guaranteed to find the mathematically optimal lowest-cost path.

---

### Q6: How does link failure detection and automated recovery work in NetResQ?
**Answer:**
1. **Failure Notification:** A link down event occurs (simulated via API or triggered by OpenFlow `OFPPortStatus` / LLDP timeout).
2. **Graph Pruning:** The failed link is marked `DOWN` and completely excluded from the NetworkX edge graph.
3. **Dynamic Recomputation:** The routing engine executes Dijkstra with the quality-aware cost function over the surviving topology.
4. **Failover Execution:** If an alternate path exists (e.g., rerouting via the triangle's third switch), it becomes the active route.
5. **Recovery Benchmark:** The computation time is recorded using a monotonic clock (`time.perf_counter()`).

---

### Q7: What happens if a network partition occurs and no alternate path exists?
**Answer:**
If all links leading to a destination are down, `nx.has_path()` returns `False`. Rather than crashing, NetResQ cleanly returns status `"no_path"`, reports the unreachable destination, logs a high-severity error event, and displays a clear message to the operator on the dashboard.

---

### Q8: What is the difference between "Software Route Computation Time" and "Packet-Level Recovery Time"?
**Answer:**
NetResQ maintains strict technical honesty:
- **Route computation time** (~1 to 3ms) is the software execution time required by the CPU to prune the graph and run Dijkstra to determine the new path.
- **Physical packet-level recovery time** in a real network includes hardware link-down detection (carrier loss / LOS), OpenFlow asynchronous messaging to the controller, flow table installation (`OFPFlowMod`), and packet buffer flushing, which can range from 20ms to 200ms depending on switch hardware.

---

### Q9: How does the Simulation Mode differ from Real SDN Mode?
**Answer:**
We designed an adapter abstraction pattern (`NetworkAdapter`):
- **Simulation Mode** (Default): Uses an authoritative in-memory NetworkX model. It runs locally on any operating system without requiring root permissions, Mininet, or Linux kernels, ensuring a 100% reproducible demo.
- **Real SDN Mode**: Interfaces with a real OpenFlow 1.3 controller (Ryu/OS-Ken) running on Linux or WSL2, querying live switches via REST APIs.

---

### Q10: What are the main limitations and areas for future improvement?
**Answer:**
1. **Measurement Overhead:** Polling real switches for packet counts can introduce control channel overhead at extreme scales.
2. **Route Flapping:** If link metrics fluctuate rapidly near the decision threshold, frequent rerouting can cause out-of-order packets. In production, a hysteresis threshold or moving average filter should be applied.
3. **Multi-Constraint QoS:** When strict hard bounds are required (e.g., latency must be $< 10\text{ms}$ AND bandwidth $> 500\text{Mbps}$ simultaneously), the problem becomes NP-complete, requiring heuristic or multi-objective algorithms.
