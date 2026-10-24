"""Unit tests for Quality-Aware Routing Algorithm."""

import pytest
from app.algorithms.quality_aware import calculate_link_cost, compute_quality_aware_path
from app.config import DEFAULT_NODES, DEFAULT_LINKS
from app.models import LinkModel, NodeModel, RoutingAlgorithm, WeightConfigModel


@pytest.fixture
def default_weights():
    return WeightConfigModel(
        configured_cost_weight=1.0,
        latency_weight=1.0,
        loss_weight=2.0,
        utilization_weight=1.5,
        latency_reference_ms=50.0
    )


@pytest.fixture
def sample_topology():
    nodes = [NodeModel(**n) for n in DEFAULT_NODES]
    links = [LinkModel(**l) for l in DEFAULT_LINKS]
    return nodes, links


def test_link_cost_formula(default_weights):
    """Tests the exact mathematical calculation of link cost according to formula:
    norm_lat = 25 / 50 = 0.5 -> lat_term = 1.0 * 0.5 = 0.5
    norm_loss = 10% / 100 = 0.1 -> loss_term = 2.0 * 0.1 = 0.2
    norm_util = 50% / 100 = 0.5 -> util_term = 1.5 * 0.5 = 0.75
    cost_term = 1.0 * 1.0 = 1.0
    total = 1.0 + 0.5 + 0.2 + 0.75 = 2.45
    """
    link = LinkModel(
        id="TEST_LINK",
        source="S1",
        target="S2",
        latency_ms=25.0,
        packet_loss_percent=10.0,
        utilization_percent=50.0,
        configured_cost=1.0
    )
    cost, breakdown = calculate_link_cost(link, default_weights)
    assert abs(cost - 2.45) < 0.001
    assert breakdown["normalized_latency"] == 0.5
    assert breakdown["normalized_loss"] == 0.1
    assert breakdown["normalized_utilization"] == 0.5


def test_quality_aware_prefers_healthy_alternate_path(sample_topology, default_weights):
    """Verifies that when direct link L_S1_S3 is degraded with high latency and packet loss,
    the quality-aware algorithm automatically routes through S2 (H1 -> S1 -> S2 -> S3 -> H4)
    even though it has more hops!
    """
    nodes, links = sample_topology

    # Inject degradation on direct link L_S1_S3:
    # 70ms latency, 20% loss, 90% utilization
    for link in links:
        if link.id == "L_S1_S3":
            link.latency_ms = 70.0
            link.packet_loss_percent = 20.0
            link.utilization_percent = 90.0

    result = compute_quality_aware_path(nodes, links, default_weights, "H1", "H4")
    assert result.status == "found"
    # Should choose S1 -> S2 -> S3 to avoid degraded S1 -> S3
    assert result.path == ["H1", "S1", "S2", "S3", "H4"]
    assert "L_S1_S3" not in result.links


def test_quality_aware_excludes_down_link(sample_topology, default_weights):
    """Verifies that DOWN links are strictly excluded from consideration."""
    nodes, links = sample_topology
    for link in links:
        if link.id == "L_S1_S2":
            link.status = "down"

    result = compute_quality_aware_path(nodes, links, default_weights, "H1", "H3")
    # S1 -> S2 is down, so path must route S1 -> S3 -> S2 -> H3
    assert result.status == "found"
    assert result.path == ["H1", "S1", "S3", "S2", "H3"]
    assert "L_S1_S2" not in result.links


def test_weight_sensitivity(sample_topology):
    """Verifies that changing weights influences routing decision."""
    nodes, links = sample_topology
    # If loss weight is zero, a lossy link might still be favored if configured cost dominates
    weights_ignore_loss = WeightConfigModel(
        configured_cost_weight=5.0,
        latency_weight=0.1,
        loss_weight=0.0,
        utilization_weight=0.1,
        latency_reference_ms=50.0
    )

    for link in links:
        if link.id == "L_S1_S3":
            link.packet_loss_percent = 25.0  # high loss

    res = compute_quality_aware_path(nodes, links, weights_ignore_loss, "H1", "H4")
    # Because loss weight is 0 and configured cost is heavily weighted, the shorter hop path is chosen
    assert res.path == ["H1", "S1", "S3", "H4"]
