"""Metrics and performance aggregation service for NetResQ.

Calculates topology-wide telemetry (latency, packet loss, utilization, health scores)
and records rolling time-series telemetry for real-time charting.
"""

from datetime import datetime, timezone
from typing import Dict, List, Any
import time

from app.models import LinkStatus, NodeType
from app.services.topology_service import topology_service


class MetricsService:
    """Aggregates real-time network telemetry and historical time series."""

    def __init__(self, max_history: int = 30):
        self._max_history = max_history
        self._history: List[Dict[str, Any]] = []
        self._record_initial_snapshots()

    def _record_initial_snapshots(self):
        """Pre-populate a few baseline historical ticks."""
        now = time.time()
        for i in range(5, 0, -1):
            t = datetime.fromtimestamp(now - (i * 5), timezone.utc).strftime("%H:%M:%S")
            self._history.append({
                "time": t,
                "avg_latency": 6.0,
                "avg_loss": 0.0,
                "avg_utilization": 15.0,
                "health_score": 100.0
            })

    def get_summary_metrics(self) -> Dict[str, Any]:
        """Calculates current aggregate telemetry across the active topology."""
        topology = topology_service.get_topology()
        nodes = topology.nodes
        links = topology.links

        switches = [n for n in nodes if n.type == NodeType.SWITCH]
        hosts = [n for n in nodes if n.type == NodeType.HOST]

        active_links = [l for l in links if l.status != LinkStatus.DOWN]
        failed_links = [l for l in links if l.status == LinkStatus.DOWN]
        degraded_links = [l for l in links if l.status == LinkStatus.DEGRADED]

        # Calculate averages for active links
        if active_links:
            avg_latency = round(sum(l.latency_ms for l in active_links) / len(active_links), 2)
            avg_loss = round(sum(l.packet_loss_percent for l in active_links) / len(active_links), 2)
            avg_utilization = round(sum(l.utilization_percent for l in active_links) / len(active_links), 2)
        else:
            avg_latency = 0.0
            avg_loss = 100.0
            avg_utilization = 0.0

        # Health score (0-100)
        # Penalties:
        # - each failed core link: -25
        # - packet loss: -1.0 per %
        # - high latency (>30ms): -1.0 per ms above 30
        health = 100.0
        health -= (len(failed_links) * 25.0)
        health -= (avg_loss * 1.5)
        if avg_latency > 30.0:
            health -= (avg_latency - 30.0)
        health = max(0.0, min(100.0, round(health, 1)))

        # Snapshot for time-series charts
        now_str = datetime.now(timezone.utc).strftime("%H:%M:%S")
        snapshot = {
            "time": now_str,
            "avg_latency": avg_latency,
            "avg_loss": avg_loss,
            "avg_utilization": avg_utilization,
            "health_score": health
        }

        # Keep rolling window
        if not self._history or self._history[-1]["time"] != now_str:
            self._history.append(snapshot)
            if len(self._history) > self._max_history:
                self._history.pop(0)

        return {
            "switches_count": len(switches),
            "hosts_count": len(hosts),
            "total_links": len(links),
            "healthy_links_count": len([l for l in links if l.status == LinkStatus.UP]),
            "failed_links_count": len(failed_links),
            "degraded_links_count": len(degraded_links),
            "average_latency_ms": avg_latency,
            "average_packet_loss_percent": avg_loss,
            "average_utilization_percent": avg_utilization,
            "network_health_score": health,
            "history": self._history
        }


# Global singleton instance
metrics_service = MetricsService()
