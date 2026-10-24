"""Baseline Shortest-Path Routing Algorithm (Dijkstra)

This module implements the standard baseline routing algorithm using Dijkstra's algorithm.
The edge weight is strictly based on the configured administrative cost (or hop count = 1.0).
It operates only on active links (status != 'down').
"""

import time
from typing import Dict, List, Optional, Tuple, Any
import networkx as nx

from app.models import LinkModel, NodeModel, RouteResultModel, RoutingAlgorithm


def build_baseline_graph(
    nodes: List[NodeModel],
    links: List[LinkModel]
) -> nx.Graph:
    """Builds a NetworkX undirected graph for baseline routing.
    Only links that are UP or DEGRADED are added. FAILED (DOWN) links are strictly excluded.
    The baseline edge weight is the link's configured administrative cost.
    """
    g = nx.Graph()
    for node in nodes:
        g.add_node(node.id, type=node.type, name=node.name)

    for link in links:
        if link.status == "down":
            continue  # Exclude failed links
        
        # Base weight: configured administrative cost (default 1.0)
        weight = float(link.configured_cost) if link.configured_cost > 0 else 1.0
        g.add_edge(
            link.source,
            link.target,
            id=link.id,
            weight=weight,
            latency_ms=link.latency_ms,
            packet_loss_percent=link.packet_loss_percent,
            utilization_percent=link.utilization_percent,
            throughput_mbps=link.throughput_mbps,
            link_model=link
        )
    return g


def compute_shortest_path(
    nodes: List[NodeModel],
    links: List[LinkModel],
    source: str,
    destination: str
) -> RouteResultModel:
    """Computes the shortest path using standard Dijkstra's algorithm based on hop/administrative cost.
    
    Returns a RouteResultModel containing:
    - ordered path
    - traversed switches
    - traversed link IDs
    - total cost (hop/administrative)
    - computation time (ms)
    - explanation
    """
    start_time = time.perf_counter()

    # Validate source and destination exist in topology
    node_ids = {n.id for n in nodes}
    if source not in node_ids:
        return RouteResultModel(
            source=source,
            destination=destination,
            algorithm=RoutingAlgorithm.SHORTEST_PATH,
            status="error",
            explanation=f"Source node '{source}' does not exist in topology."
        )
    if destination not in node_ids:
        return RouteResultModel(
            source=source,
            destination=destination,
            algorithm=RoutingAlgorithm.SHORTEST_PATH,
            status="error",
            explanation=f"Destination node '{destination}' does not exist in topology."
        )

    if source == destination:
        return RouteResultModel(
            source=source,
            destination=destination,
            algorithm=RoutingAlgorithm.SHORTEST_PATH,
            path=[source],
            total_cost=0.0,
            hop_count=0,
            status="found",
            explanation="Source and destination are identical; 0 hops required."
        )

    g = build_baseline_graph(nodes, links)

    # Check if a path exists
    if not nx.has_path(g, source, destination):
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        return RouteResultModel(
            source=source,
            destination=destination,
            algorithm=RoutingAlgorithm.SHORTEST_PATH,
            status="no_path",
            computation_time_ms=round(elapsed_ms, 3),
            explanation=f"Network partition or link failure: No active path connects '{source}' to '{destination}'."
        )

    # Compute Dijkstra path using edge weight
    try:
        path = nx.dijkstra_path(g, source, destination, weight="weight")
        path_cost = nx.dijkstra_path_length(g, source, destination, weight="weight")
    except nx.NetworkXNoPath:
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        return RouteResultModel(
            source=source,
            destination=destination,
            algorithm=RoutingAlgorithm.SHORTEST_PATH,
            status="no_path",
            computation_time_ms=round(elapsed_ms, 3),
            explanation=f"No route found between '{source}' and '{destination}'."
        )

    elapsed_ms = (time.perf_counter() - start_time) * 1000

    # Extract link IDs, per-link costs, switches
    node_map = {n.id: n for n in nodes}
    traversed_links = []
    per_link_costs = {}
    per_link_metrics = {}
    switches = []

    for i in range(len(path) - 1):
        u, v = path[i], path[i + 1]
        edge_data = g.get_edge_data(u, v)
        link_id = edge_data["id"]
        weight = edge_data["weight"]
        traversed_links.append(link_id)
        per_link_costs[link_id] = round(weight, 3)
        per_link_metrics[link_id] = {
            "latency_ms": edge_data["latency_ms"],
            "packet_loss_percent": edge_data["packet_loss_percent"],
            "utilization_percent": edge_data["utilization_percent"],
            "configured_cost": weight
        }

    for node_id in path:
        if node_map.get(node_id) and node_map[node_id].type == "switch":
            switches.append(node_id)

    hop_count = len(path) - 1
    explanation = (
        f"Baseline Dijkstra selected path {' -> '.join(path)} based strictly on minimum administrative "
        f"hop cost ({round(path_cost, 2)} across {hop_count} hops). "
        f"Degraded link metrics (latency/loss/congestion) are not considered."
    )

    return RouteResultModel(
        source=source,
        destination=destination,
        algorithm=RoutingAlgorithm.SHORTEST_PATH,
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
