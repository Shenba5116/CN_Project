"""Unit tests for Baseline Shortest-Path (Dijkstra) Routing Algorithm."""

import pytest
from app.algorithms.shortest_path import compute_shortest_path
from app.config import DEFAULT_NODES, DEFAULT_LINKS
from app.models import LinkModel, NodeModel, RoutingAlgorithm


@pytest.fixture
def sample_topology():
    nodes = [NodeModel(**n) for n in DEFAULT_NODES]
    links = [LinkModel(**l) for l in DEFAULT_LINKS]
    return nodes, links


def test_baseline_shortest_path_healthy(sample_topology):
    """Verifies that baseline Dijkstra computes the direct shortest path between H1 and H4."""
    nodes, links = sample_topology
    # H1 -> S1 -> S3 -> H4 is 3 hops
    result = compute_shortest_path(nodes, links, "H1", "H4")

    assert result.status == "found"
    assert result.algorithm == RoutingAlgorithm.SHORTEST_PATH
    assert result.path == ["H1", "S1", "S3", "H4"]
    assert result.hop_count == 3
    assert result.total_cost == 3.0
    assert "S1" in result.switches
    assert "S3" in result.switches


def test_baseline_direct_neighbors(sample_topology):
    """Verifies direct switch-to-switch path."""
    nodes, links = sample_topology
    result = compute_shortest_path(nodes, links, "S1", "S2")

    assert result.status == "found"
    assert result.path == ["S1", "S2"]
    assert result.hop_count == 1
    assert result.total_cost == 1.0


def test_baseline_excludes_failed_link(sample_topology):
    """Verifies that when direct link L_S1_S3 is failed (DOWN),
    the algorithm automatically selects the alternate path H1 -> S1 -> S2 -> S3 -> H4.
    """
    nodes, links = sample_topology
    # Mark L_S1_S3 as down
    for link in links:
        if link.id == "L_S1_S3":
            link.status = "down"

    result = compute_shortest_path(nodes, links, "H1", "H4")
    assert result.status == "found"
    assert result.path == ["H1", "S1", "S2", "S3", "H4"]
    assert result.hop_count == 4
    assert result.total_cost == 4.0
    assert "L_S1_S3" not in result.links


def test_baseline_disconnected_partition(sample_topology):
    """Verifies graceful handling when all connections to H4 are down."""
    nodes, links = sample_topology
    for link in links:
        if link.id == "L_H4_S3":
            link.status = "down"

    result = compute_shortest_path(nodes, links, "H1", "H4")
    assert result.status == "no_path"
    assert "No active path" in result.explanation


def test_baseline_invalid_nodes(sample_topology):
    """Verifies error handling for non-existent source or destination."""
    nodes, links = sample_topology
    res1 = compute_shortest_path(nodes, links, "NONEXISTENT", "H4")
    assert res1.status == "error"

    res2 = compute_shortest_path(nodes, links, "H1", "NONEXISTENT")
    assert res2.status == "error"
