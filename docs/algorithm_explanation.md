# NetResQ Algorithm Explanation

## 1. Traditional Baseline Dijkstra Routing

In conventional IP and SDN networks, routing algorithms (like OSPF or IS-IS) use **Dijkstra's Shortest Path Algorithm** where edge weights are static administrative costs or hop counts (defaulting to 1.0 per link).

```
Cost(Path) = Σ configured_cost(e) for e in Path
```

### Limitation of the Baseline:
If a 1-hop direct link `S1 -> S3` suffers from **65ms latency** and **20% packet loss**, the baseline algorithm continues forwarding packets over it because its hop cost is still `1.0`, completely ignoring that a 2-hop alternate path (`S1 -> S2 -> S3`) has **only 11ms latency and 0% loss**!

---

## 2. Proposed Quality-Aware Routing Algorithm

NetResQ calculates a **composite edge cost** incorporating real-time link quality metrics:
- **Configured administrative cost** ($C$)
- **One-way Latency** ($L$ in ms)
- **Packet Loss Percentage** ($P \in [0, 100]$)
- **Bandwidth Utilization Percentage** ($U \in [0, 100]$)

### Normalization Formulas:
To compare milliseconds, percentages, and arbitrary administrative costs without dimensional skewing, each metric is normalized into dimensionless scale $[0, 1]$:

$$ \text{norm\_latency} = \frac{\text{latency\_ms}}{\text{latency\_reference\_ms}} $$
$$ \text{norm\_loss} = \frac{\text{packet\_loss\_percent}}{100.0} $$
$$ \text{norm\_utilization} = \frac{\text{utilization\_percent}}{100.0} $$

### Composite Link Cost Formula:
$$ \text{Cost}(e) = w_{\text{cost}} \cdot C + w_{\text{latency}} \cdot \text{norm\_latency} + w_{\text{loss}} \cdot \text{norm\_loss} + w_{\text{util}} \cdot \text{norm\_util} $$

Default Weights:
- $w_{\text{cost}} = 1.0$
- $w_{\text{latency}} = 1.0$ (with reference latency $\text{latency\_reference\_ms} = 50.0\text{ms}$)
- $w_{\text{loss}} = 2.0$ (higher penalty for packet drops)
- $w_{\text{util}} = 1.5$ (prevents buffer saturation)

### Mathematical Guarantee for Dijkstra:
Since all weights $w \ge 0$, and metrics $\ge 0$, every calculated edge cost is strictly non-negative:
$$ \text{Cost}(e) \ge \text{MIN\_EDGE\_COST} > 0 $$
Because edge costs are strictly positive, **Dijkstra's greedy shortest-path algorithm is mathematically guaranteed to find the global minimum composite cost path** without the possibility of negative cycles.

---

## 3. Worked Numerical Demonstration

Consider traffic flowing from **H1** (attached to S1) to **H4** (attached to S3).

### Scenario: Direct Link S1 -> S3 Under Heavy Congestion
- Host links (`H1-S1`, `H4-S3`): `1ms delay`, `0% loss`, `5% util` $\to \text{Cost} \approx 1.09$
- Direct link `S1-S3`: `65ms delay`, `18% loss`, `85% util`
- Triangle link `S1-S2`: `5ms delay`, `0% loss`, `15% util`
- Triangle link `S2-S3`: `6ms delay`, `0% loss`, `10% util`

#### Path A: Direct Route (H1 -> S1 -> S3 -> H4)
- Link `S1-S3`:
  - $\text{norm\_lat} = 65 / 50 = 1.30$
  - $\text{norm\_loss} = 18 / 100 = 0.18$
  - $\text{norm\_util} = 85 / 100 = 0.85$
  - $\text{Cost}(S1-S3) = (1.0 \times 1.0) + (1.0 \times 1.30) + (2.0 \times 0.18) + (1.5 \times 0.85) = 1.0 + 1.30 + 0.36 + 1.275 = \mathbf{3.935}$
- **Total Path A Cost** = $1.09 + 3.935 + 1.09 = \mathbf{6.115}$

#### Path B: Alternate Route via S2 (H1 -> S1 -> S2 -> S3 -> H4)
- Link `S1-S2`:
  - $\text{Cost}(S1-S2) = 1.0 + (1.0 \times 0.10) + 0 + (1.5 \times 0.15) = 1.0 + 0.10 + 0.225 = \mathbf{1.325}$
- Link `S2-S3`:
  - $\text{Cost}(S2-S3) = 1.0 + (1.0 \times 0.12) + 0 + (1.5 \times 0.10) = 1.0 + 0.12 + 0.15 = \mathbf{1.270}$
- **Total Path B Cost** = $1.09 + 1.325 + 1.270 + 1.09 = \mathbf{4.775}$

### Conclusion:
- **Baseline Dijkstra** selects **Path A** because it has 3 hops (vs 4 hops), forcing packets through a link with **18% loss and 65ms latency**.
- **Quality-Aware Routing** selects **Path B** because $4.775 < 6.115$, automatically self-healing traffic over the clean alternate route!

---

## 4. Failure and Disconnection Handling

- **Exclusion of Down Links:** When a link failure is simulated or detected, the edge is omitted during graph construction. Neither algorithm can select a failed link.
- **Network Partition:** If all paths to a destination are down, `nx.has_path()` returns `False`, and NetResQ returns status `"no_path"` with a clear explanation rather than crashing.
