"""FastAPI Route Definitions for NetResQ.

Exposes REST endpoints for topology inspection, route computation, link failure/restore,
metric injections, algorithm weights tuning, event streaming, and controller diagnostics.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.models import (
    ComparisonResultModel,
    EventSeverity,
    LinkMetricsUpdateRequest,
    NetworkEventModel,
    RouteRequest,
    RouteResultModel,
    RoutingAlgorithm,
    SystemStatusModel,
    TopologyModel,
    WeightConfigModel
)
from app.services.controller_service import controller_service
from app.services.event_service import event_service
from app.services.metrics_service import metrics_service
from app.services.routing_service import routing_service
from app.services.simulation_service import simulation_service
from app.services.topology_service import topology_service

router = APIRouter(prefix="/api", tags=["NetResQ API"])


# 1. Health & Status Endpoints
@router.get("/health", summary="Backend Health Check")
def get_health() -> Dict[str, Any]:
    """Returns backend availability and timestamp."""
    return {
        "status": "healthy",
        "service": "NetResQ Adaptive Network Engine",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/status", response_model=SystemStatusModel, summary="System Status")
def get_status() -> SystemStatusModel:
    """Returns high-level system operating status and telemetry summary."""
    telemetry = metrics_service.get_summary_metrics()
    is_controller_conn = topology_service.is_controller_connected()

    return SystemStatusModel(
        mode=topology_service.mode,
        backend_online=True,
        controller_connected=is_controller_conn,
        controller_url="http://127.0.0.1:8080",
        switches_count=telemetry["switches_count"],
        hosts_count=telemetry["hosts_count"],
        healthy_links_count=telemetry["healthy_links_count"],
        failed_links_count=telemetry["failed_links_count"],
        degraded_links_count=telemetry["degraded_links_count"],
        active_algorithm=routing_service.active_algorithm,
        active_source=routing_service.active_source,
        active_destination=routing_service.active_destination,
        last_updated=datetime.now(timezone.utc).isoformat()
    )


# 2. Topology Endpoints
@router.get("/topology", response_model=TopologyModel, summary="Current Network Topology")
def get_topology() -> TopologyModel:
    """Returns all nodes (switches, hosts) and edges (links) in the current topology."""
    return topology_service.get_topology()


# 3. Metrics & Telemetry
@router.get("/metrics", summary="Network Telemetry and History")
def get_metrics() -> Dict[str, Any]:
    """Returns aggregated latency, loss, utilization, and rolling time-series data."""
    return metrics_service.get_summary_metrics()


# 4. Events Log
@router.get("/events", response_model=List[NetworkEventModel], summary="Operational Event Log")
def get_events(
    limit: int = Query(50, ge=1, le=200),
    severity: Optional[EventSeverity] = None
) -> List[NetworkEventModel]:
    """Returns chronological network events (failures, reroutes, restorations)."""
    return event_service.get_events(limit=limit, severity=severity)


@router.post("/events/clear", summary="Clear Event History")
def clear_events() -> Dict[str, Any]:
    """Clears the displayed event history log."""
    event_service.clear()
    return {"success": True, "message": "Event history cleared."}


# 5. Routing Endpoints
@router.get("/routes", response_model=RouteResultModel, summary="Get Active Route")
def get_active_route() -> RouteResultModel:
    """Returns the computed path for the currently selected active endpoints and algorithm."""
    return routing_service.compute_route(
        routing_service.active_source,
        routing_service.active_destination,
        routing_service.active_algorithm
    )


@router.post("/routes/compute", response_model=RouteResultModel, summary="Compute Route")
def compute_route(req: RouteRequest) -> RouteResultModel:
    """Computes a route between any two endpoints using Baseline Dijkstra or Quality-Aware algorithm."""
    routing_service.set_active_endpoints(source=req.source, destination=req.destination, algorithm=req.algorithm)
    return routing_service.compute_route(req.source, req.destination, req.algorithm)


@router.get("/comparison", response_model=ComparisonResultModel, summary="Compare Baseline vs Quality-Aware Routes")
def get_comparison(
    source: Optional[str] = Query(None),
    destination: Optional[str] = Query(None)
) -> ComparisonResultModel:
    """Computes and compares Baseline Dijkstra vs Quality-Aware routing under identical network conditions."""
    return routing_service.compare_routes(source, destination)


# 6. Failure & Link Control Endpoints
@router.post("/links/{link_id}/fail", summary="Trigger Link Failure")
def fail_link(link_id: str) -> Dict[str, Any]:
    """Simulates an abrupt link failure, triggers automatic failover, and returns new route."""
    result = simulation_service.fail_link(link_id)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("message"))
    return result


@router.post("/links/{link_id}/restore", summary="Restore Link")
def restore_link(link_id: str) -> Dict[str, Any]:
    """Restores a failed link back to UP service and updates active routes."""
    result = simulation_service.restore_link(link_id)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("message"))
    return result


@router.post("/links/{link_id}/metrics", summary="Update Link Metrics")
def update_link_metrics(link_id: str, updates: LinkMetricsUpdateRequest) -> Dict[str, Any]:
    """Updates latency, packet loss, or utilization for a link to test route adaptation."""
    result = simulation_service.update_link_metrics(link_id, updates)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("message"))
    return result


# 7. Simulation Controls
@router.post("/simulation/reset", summary="Reset Simulation Topology")
def reset_simulation() -> Dict[str, Any]:
    """Restores the topology, links, and metrics back to initial healthy baseline state."""
    return simulation_service.reset_scenario()


@router.post("/simulation/congestion", summary="Inject Demo Congestion Preset")
def inject_congestion() -> Dict[str, Any]:
    """Applies the demonstration congestion scenario on link L_S1_S3."""
    return simulation_service.inject_congestion_preset()


# 8. Algorithm Weights Configuration
@router.get("/weights", response_model=WeightConfigModel, summary="Get Quality-Aware Routing Weights")
def get_weights() -> WeightConfigModel:
    """Returns the current weighting coefficients used in the quality-aware cost formula."""
    return routing_service.weights


@router.post("/weights", response_model=WeightConfigModel, summary="Update Quality-Aware Routing Weights")
def update_weights(weights: WeightConfigModel) -> WeightConfigModel:
    """Updates weighting coefficients for configured cost, latency, packet loss, and utilization."""
    return routing_service.update_weights(weights)


# 9. Controller & Mode Switch
@router.get("/controller/status", summary="SDN Controller Status")
def get_controller_status() -> Dict[str, Any]:
    """Returns diagnostic connectivity info for the external Ryu/OS-Ken SDN controller."""
    return controller_service.get_status()


@router.post("/mode", summary="Switch Operating Mode")
def switch_mode(mode: str = Query(..., description="'simulation' or 'sdn'")) -> Dict[str, Any]:
    """Switches system between Simulation mode and Real SDN Controller mode."""
    success, msg = topology_service.set_mode(mode)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
    return {"success": True, "mode": topology_service.mode, "message": msg}
