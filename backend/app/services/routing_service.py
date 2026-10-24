"""Routing computation and comparison service for NetResQ.

Manages algorithm configuration weights, route requests, baseline vs. quality-aware
evaluations, and path comparison metrics.
"""

from typing import Dict, List, Optional, Tuple, Any

from app.algorithms.shortest_path import compute_shortest_path
from app.algorithms.quality_aware import compute_quality_aware_path, calculate_link_cost
from app.config import (
    DEFAULT_CONFIGURED_COST_WEIGHT,
    DEFAULT_LATENCY_WEIGHT,
    DEFAULT_LOSS_WEIGHT,
    DEFAULT_UTILIZATION_WEIGHT,
    DEFAULT_LATENCY_REFERENCE_MS
)
from app.models import (
    ComparisonResultModel,
    RouteRequest,
    RouteResultModel,
    RoutingAlgorithm,
    WeightConfigModel
)
from app.services.topology_service import topology_service


class RoutingService:
    """Computes and compares routing strategies over the current topology."""

    def __init__(self):
        self._weights = WeightConfigModel(
            configured_cost_weight=DEFAULT_CONFIGURED_COST_WEIGHT,
            latency_weight=DEFAULT_LATENCY_WEIGHT,
            loss_weight=DEFAULT_LOSS_WEIGHT,
            utilization_weight=DEFAULT_UTILIZATION_WEIGHT,
            latency_reference_ms=DEFAULT_LATENCY_REFERENCE_MS
        )
        self._active_source: str = "H1"
        self._active_destination: str = "H4"
        self._active_algorithm: RoutingAlgorithm = RoutingAlgorithm.QUALITY_AWARE

    @property
    def weights(self) -> WeightConfigModel:
        return self._weights

    def update_weights(self, new_weights: WeightConfigModel) -> WeightConfigModel:
        self._weights = new_weights
        return self._weights

    @property
    def active_source(self) -> str:
        return self._active_source

    @property
    def active_destination(self) -> str:
        return self._active_destination

    @property
    def active_algorithm(self) -> RoutingAlgorithm:
        return self._active_algorithm

    def set_active_endpoints(
        self,
        source: Optional[str] = None,
        destination: Optional[str] = None,
        algorithm: Optional[RoutingAlgorithm] = None
    ) -> None:
        if source:
            self._active_source = source
        if destination:
            self._active_destination = destination
        if algorithm:
            self._active_algorithm = algorithm

    def compute_route(
        self,
        source: str,
        destination: str,
        algorithm: RoutingAlgorithm
    ) -> RouteResultModel:
        """Computes path for given algorithm over the current topology."""
        topology = topology_service.get_topology()
        nodes = topology.nodes
        links = topology.links

        if algorithm == RoutingAlgorithm.SHORTEST_PATH:
            return compute_shortest_path(nodes, links, source, destination)
        else:
            return compute_quality_aware_path(nodes, links, self._weights, source, destination)

    def compare_routes(
        self,
        source: Optional[str] = None,
        destination: Optional[str] = None
    ) -> ComparisonResultModel:
        """Computes both Baseline and Quality-Aware routes for the same source and destination,
        and provides comparative analysis.
        """
        src = source or self._active_source
        dst = destination or self._active_destination

        topology = topology_service.get_topology()
        nodes = topology.nodes
        links = topology.links

        baseline = compute_shortest_path(nodes, links, src, dst)
        quality = compute_quality_aware_path(nodes, links, self._weights, src, dst)

        paths_differ = (baseline.path != quality.path)
        cost_diff = round(quality.total_cost - baseline.total_cost, 3)

        if baseline.status != "found" and quality.status != "found":
            explanation = f"Neither algorithm could find a path between '{src}' and '{dst}' due to network disconnection."
        elif paths_differ:
            explanation = (
                f"Algorithms selected different paths! Baseline chose {len(baseline.path)-1} hops ({' -> '.join(baseline.path)}) "
                f"strictly on hop cost. Quality-Aware chose {' -> '.join(quality.path)} to avoid degraded links (cost {quality.total_cost})."
            )
        else:
            explanation = (
                f"Both algorithms converged on the same path ({' -> '.join(quality.path)}). "
                f"No alternative path offered superior quality under current conditions."
            )

        return ComparisonResultModel(
            source=src,
            destination=dst,
            baseline_route=baseline,
            quality_aware_route=quality,
            cost_difference=cost_diff,
            paths_differ=paths_differ,
            explanation=explanation
        )


# Global singleton instance
routing_service = RoutingService()
