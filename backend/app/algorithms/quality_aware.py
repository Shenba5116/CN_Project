"""Quality-Aware Routing Algorithm

This module implements the proposed quality-aware routing algorithm for NetResQ.
It balances administrative cost against real-time link quality metrics (latency, packet loss,
and link utilization) using a normalized weighted cost model.

Formula:
    normalized_latency     = latency_ms / latency_reference_ms
    normalized_loss        = packet_loss_percent / 100.0
    normalized_utilization = utilization_percent / 100.0

    link_cost = (
        configured_cost_weight * configured_cost
        + latency_weight * normalized_latency
        + loss_weight * normalized_loss
        + utilization_weight * normalized_utilization
    )

Failed links (status == "down") are strictly excluded prior to path calculation.
Costs are guaranteed to be positive and non-negative, allowing Dijkstra's algorithm to
guarantee finding the global optimal path under the configured policy.
"""

import time
from typing import Dict, List, Optional, Tuple, Any
import networkx as nx

from app.config import MIN_EDGE_COST
from app.models import LinkModel, NodeModel, RouteResultModel, RoutingAlgorithm, WeightConfigModel


def calculate_link_cost(
    link: LinkModel,
    weights: WeightConfigModel
) -> Tuple[float, Dict[str, float]]:
    """Calculates the composite quality-aware cost for a single link.
    
    Returns:
        (total_cost, breakdown_dict)
    """
    ref_latency = max(weights.latency_reference_ms, 0.001)

    norm_lat = max(link.latency_ms, 0.0) / ref_latency
    norm_loss = max(min(link.packet_loss_percent, 100.0), 0.0) / 100.0
    norm_util = max(min(link.utilization_percent, 100.0), 0.0) / 100.0
    base_cost = max(link.configured_cost, 0.0)

    cost_term = weights.configured_cost_weight * base_cost
    lat_term = weights.latency_weight * norm_lat
    loss_term = weights.loss_weight * norm_loss
    util_term = weights.utilization_weight * norm_util

    composite_cost = cost_term + lat_term + loss_term + util_term
    final_cost = max(composite_cost, MIN_EDGE_COST)

    breakdown = {
        "configured_cost_term": round(cost_term, 4),
        "latency_term": round(lat_term, 4),
        "loss_term": round(loss_term, 4),
        "utilization_term": round(util_term, 4),
        "normalized_latency": round(norm_lat, 4),
        "normalized_loss": round(norm_loss, 4),
        "normalized_utilization": round(norm_util, 4),
        "final_cost": round(final_cost, 4)
    }

    return final_cost, breakdown


def build_quality_aware_graph(
    nodes: List[NodeModel],
    links: List[LinkModel],
    weights: WeightConfigModel
) -> Tuple[nx.Graph, Dict[str, Dict[str, Any]]]:
    """Builds a NetworkX graph using quality-aware edge costs.
    Excludes failed links (status == 'down').
    Returns (graph, link_cost_details_map).
    """
    g = nx.Graph()
    cost_details = {}

    for node in nodes:
        g.add_node(node.id, type=node.type, name=node.name)

    for link in links:
        if link.status == "down":
            continue  # Exclude failed links completely

        cost, breakdown = calculate_link_cost(link, weights)
        cost_details[link.id] = breakdown

        g.add_edge(
            link.source,
            link.target,
            id=link.id,
            weight=cost,
            link_model=link,
            breakdown=breakdown,
            latency_ms=link.latency_ms,
            packet_loss_percent=link.packet_loss_percent,
            utilization_percent=link.utilization_percent,
            throughput_mbps=link.throughput_mbps
        )

    return g, cost_details


def compute_quality_aware_path(
    nodes: List[NodeModel],
    links: List[LinkModel],
    weights: WeightConfigModel,
    source: str,
    destination: str
) -> RouteResultModel:
    """Computes the quality-aware lowest-cost path using Dijkstra's algorithm.
    """
    start_time = time.perf_counter()

    node_ids = {n.id for n in nodes}
    if source not in node_ids:
        return RouteResultModel(
            source=source,
            destination=destination,
            algorithm=RoutingAlgorithm.QUALITY_AWARE,
            status="error",
            explanation=f"Source node '{source}' does not exist in topology."
        )
    if destination not in node_ids:
        return RouteResultModel(
            source=source,
            destination=destination,
            algorithm=RoutingAlgorithm.QUALITY_AWARE,
            status="error",
            explanation=f"Destination node '{destination}' does not exist in topology."
        )

    if source == destination:
        return RouteResultModel(
            source=source,
            destination=destination,
            algorithm=RoutingAlgorithm.QUALITY_AWARE,
            path=[source],
            total_cost=0.0,
            hop_count=0,
            status="found",
            explanation="Source and destination are identical; 0 hops required."
        )

    g, cost_details = build_quality_aware_graph(nodes, links, weights)

    if not nx.has_path(g, source, destination):
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        return RouteResultModel(
            source=source,
            destination=destination,
            algorithm=RoutingAlgorithm.QUALITY_AWARE,
            status="no_path",
            computation_time_ms=round(elapsed_ms, 3),
            explanation=f"No viable path connects '{source}' to '{destination}' under current topology constraints."
        )

    try:
        path = nx.dijkstra_path(g, source, destination, weight="weight")
        path_cost = nx.dijkstra_path_length(g, source, destination, weight="weight")
    except nx.NetworkXNoPath:
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        return RouteResultModel(
            source=source,
            destination=destination,
            algorithm=RoutingAlgorithm.QUALITY_AWARE,
            status="no_path",
            computation_time_ms=round(elapsed_ms, 3),
            explanation=f"No viable path found between '{source}' and '{destination}'."
        )

    elapsed_ms = (time.perf_counter() - start_time) * 1000

    node_map = {n.id: n for n in nodes}
    traversed_links = []
    per_link_costs = {}
    per_link_metrics = {}
    switches = []

    total_latency = 0.0
    max_loss = 0.0
    avg_util = 0.0

    for i in range(len(path) - 1):
        u, v = path[i], path[i + 1]
        edge_data = g.get_edge_data(u, v)
        link_id = edge_data["id"]
        weight = edge_data["weight"]
        traversed_links.append(link_id)
        per_link_costs[link_id] = round(weight, 3)

        lat = edge_data["latency_ms"]
        loss = edge_data["packet_loss_percent"]
        util = edge_data["utilization_percent"]

        total_latency += lat
        max_loss = max(max_loss, loss)
        avg_util += util

        per_link_metrics[link_id] = {
            "latency_ms": lat,
            "packet_loss_percent": loss,
            "utilization_percent": util,
            "calculated_cost": round(weight, 3)
        }

    hop_count = len(path) - 1
    if hop_count > 0:
        avg_util /= hop_count

    for node_id in path:
        if node_map.get(node_id) and node_map[node_id].type == "switch":
            switches.append(node_id)

    explanation = (
        f"Quality-Aware route selected {' -> '.join(path)} (composite cost {round(path_cost, 2)}). "
        f"Accounting for total latency of {round(total_latency, 1)}ms, max packet loss of {round(max_loss, 1)}%, "
        f"and average utilization of {round(avg_util, 1)}%."
    )

    return RouteResultModel(
        source=source,
        destination=destination,
        algorithm=RoutingAlgorithm.QUALITY_AWARE,
        path=path,
        switches=switches,
        links=traversed_links,
        total_cost=round(path_cost, 3),
        hop_count=hop_count,
        computation_time_ms=round(elapsed_ms, 3),
        per_link_costs=per_link_costs,
        per_link_metrics=per_link_metrics,
        explanation=explanation,
        status="found"
    )
