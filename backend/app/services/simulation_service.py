"""Simulation and Failover orchestrator service for NetResQ.

Handles failure injection, link restoration, congestion emulation, route recalculation,
and simulated recovery time benchmarking.
"""

import time
from typing import Dict, List, Optional, Tuple, Any

from app.models import EventSeverity, LinkMetricsUpdateRequest, RouteResultModel
from app.services.event_service import event_service
from app.services.routing_service import routing_service
from app.services.topology_service import topology_service


class SimulationService:
    """Orchestrates link failures, restorations, congestion presets, and failovers."""

    def fail_link(self, link_id: str) -> Dict[str, Any]:
        """Simulates an abrupt link failure.
        Excludes the link, recomputes the active route, measures software failover time,
        and logs the transition.
        """
        # Capture previous route prior to failure
        prev_route = routing_service.compute_route(
            routing_service.active_source,
            routing_service.active_destination,
            routing_service.active_algorithm
        )

        start_timer = time.perf_counter()
        success, msg = topology_service.fail_link(link_id)
        if not success:
            event_service.log_event(
                event_type="FAILURE_FAILED",
                severity=EventSeverity.WARNING,
                message=f"Failed to fail link {link_id}: {msg}"
            )
            return {"success": False, "message": msg}

        # Measure software route recomputation time (simulated failover duration)
        new_route = routing_service.compute_route(
            routing_service.active_source,
            routing_service.active_destination,
            routing_service.active_algorithm
        )
        elapsed_ms = (time.perf_counter() - start_timer) * 1000

        # Log event
        if new_route.status == "found":
            event_msg = (
                f"Link '{link_id}' DOWN. Self-healing triggered: rerouted from "
                f"[{' -> '.join(prev_route.path)}] to [{' -> '.join(new_route.path)}] in {round(elapsed_ms, 2)}ms."
            )
            severity = EventSeverity.WARNING
        else:
            event_msg = f"Link '{link_id}' DOWN. No alternate route available; network destination unreachable!"
            severity = EventSeverity.ERROR

        event = event_service.log_event(
            event_type="LINK_FAILURE",
            severity=severity,
            message=event_msg,
            details={
                "failed_link": link_id,
                "recalculation_time_ms": round(elapsed_ms, 3),
                "previous_path": prev_route.path,
                "new_path": new_route.path,
                "status": new_route.status
            }
        )

        return {
            "success": True,
            "message": msg,
            "failed_link": link_id,
            "recalculation_time_ms": round(elapsed_ms, 3),
            "previous_route": prev_route,
            "new_route": new_route,
            "event": event
        }

    def restore_link(self, link_id: str) -> Dict[str, Any]:
        """Restores a failed link back to UP status."""
        start_timer = time.perf_counter()
        success, msg = topology_service.restore_link(link_id)
        if not success:
            return {"success": False, "message": msg}

        new_route = routing_service.compute_route(
            routing_service.active_source,
            routing_service.active_destination,
            routing_service.active_algorithm
        )
        elapsed_ms = (time.perf_counter() - start_timer) * 1000

        event = event_service.log_event(
            event_type="LINK_RESTORED",
            severity=EventSeverity.SUCCESS,
            message=f"Link '{link_id}' RESTORED to active service. Route recalculated in {round(elapsed_ms, 2)}ms.",
            details={
                "restored_link": link_id,
                "active_path": new_route.path,
                "total_cost": new_route.total_cost
            }
        )

        return {
            "success": True,
            "message": msg,
            "restored_link": link_id,
            "recalculation_time_ms": round(elapsed_ms, 3),
            "new_route": new_route,
            "event": event
        }

    def update_link_metrics(self, link_id: str, updates: LinkMetricsUpdateRequest) -> Dict[str, Any]:
        """Modifies latency, packet loss, or utilization for a link to simulate degradation/congestion."""
        success, msg = topology_service.update_link_metrics(link_id, updates)
        if not success:
            return {"success": False, "message": msg}

        new_route = routing_service.compute_route(
            routing_service.active_source,
            routing_service.active_destination,
            routing_service.active_algorithm
        )

        detail_items = []
        if updates.latency_ms is not None:
            detail_items.append(f"latency={updates.latency_ms}ms")
        if updates.packet_loss_percent is not None:
            detail_items.append(f"loss={updates.packet_loss_percent}%")
        if updates.utilization_percent is not None:
            detail_items.append(f"util={updates.utilization_percent}%")

        event = event_service.log_event(
            event_type="LINK_METRICS_UPDATED",
            severity=EventSeverity.INFO,
            message=f"Link '{link_id}' metrics updated ({', '.join(detail_items)}). Quality-Aware route re-evaluated.",
            details={
                "link_id": link_id,
                "updates": updates.model_dump(exclude_none=True),
                "active_path": new_route.path,
                "new_cost": new_route.total_cost
            }
        )

        return {
            "success": True,
            "message": msg,
            "link_id": link_id,
            "new_route": new_route,
            "event": event
        }

    def inject_congestion_preset(self) -> Dict[str, Any]:
        """Demonstration preset: Injects heavy latency (60ms) and 15% packet loss on direct link L_S1_S3.
        Demonstrates Quality-Aware routing automatically choosing S1 -> S2 -> S3 to avoid degraded link.
        """
        link_id = "L_S1_S3"
        updates = LinkMetricsUpdateRequest(
            latency_ms=65.0,
            packet_loss_percent=18.0,
            utilization_percent=85.0
        )
        res = self.update_link_metrics(link_id, updates)

        event_service.log_event(
            event_type="DEMO_PRESET_CONGESTION",
            severity=EventSeverity.WARNING,
            message="Demonstration Congestion Preset injected: Link L_S1_S3 degraded (65ms latency, 18% loss, 85% util).",
            details={"link": link_id}
        )

        return res

    def reset_scenario(self) -> Dict[str, Any]:
        """Resets the topology, metrics, and routes back to clean default baseline."""
        success, msg = topology_service.reset_topology()
        routing_service.set_active_endpoints(source="H1", destination="H4")
        fresh_route = routing_service.compute_route("H1", "H4", routing_service.active_algorithm)

        event = event_service.log_event(
            event_type="SIMULATION_RESET",
            severity=EventSeverity.INFO,
            message="Network simulation topology and metrics reset to default healthy baseline.",
            details={"active_route": fresh_route.path}
        )

        return {
            "success": True,
            "message": msg,
            "active_route": fresh_route,
            "event": event
        }


# Global singleton instance
simulation_service = SimulationService()
