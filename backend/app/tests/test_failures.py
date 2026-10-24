"""Unit tests for Network Failure Simulation, Alternate Route Selection, and Recovery."""

import pytest
from app.services.simulation_service import simulation_service
from app.services.topology_service import topology_service
from app.services.routing_service import routing_service
from app.models import LinkStatus


@pytest.fixture(autouse=True)
def reset_state_before_each_test():
    """Ensure clean baseline state before each test."""
    simulation_service.reset_scenario()


def test_link_failure_and_failover():
    """Simulates failing L_S1_S3, and confirms that routing reroutes via S2."""
    routing_service.set_active_endpoints(source="H1", destination="H4")

    # Initial route is H1 -> S1 -> S3 -> H4
    init_route = routing_service.compute_route("H1", "H4", routing_service.active_algorithm)
    assert init_route.path == ["H1", "S1", "S3", "H4"]

    # Trigger failure
    res = simulation_service.fail_link("L_S1_S3")
    assert res["success"] is True
    assert res["failed_link"] == "L_S1_S3"
    assert res["recalculation_time_ms"] >= 0.0

    # New route must be through S2
    new_route = res["new_route"]
    assert new_route.status == "found"
    assert new_route.path == ["H1", "S1", "S2", "S3", "H4"]
    assert "L_S1_S3" not in new_route.links


def test_link_restoration():
    """Fails a link and then restores it."""
    simulation_service.fail_link("L_S1_S3")

    # Restore the link
    res = simulation_service.restore_link("L_S1_S3")
    assert res["success"] is True

    # Check topology reflects UP
    topo = topology_service.get_topology()
    link = next(l for l in topo.links if l.id == "L_S1_S3")
    assert link.status == LinkStatus.UP


def test_repeated_failures_do_not_corrupt_graph():
    """Verifies that multiple repeated failure/recovery cycles maintain graph integrity."""
    for _ in range(5):
        simulation_service.fail_link("L_S1_S2")
        simulation_service.restore_link("L_S1_S2")

    topo = topology_service.get_topology()
    assert len(topo.nodes) == 7
    assert len(topo.links) == 7
    link = next(l for l in topo.links if l.id == "L_S1_S2")
    assert link.status == LinkStatus.UP


def test_network_partition_handling():
    """Fails both paths to S3 (L_S1_S3 and L_S2_S3), ensuring no_path is handled gracefully."""
    simulation_service.fail_link("L_S1_S3")
    simulation_service.fail_link("L_S2_S3")

    route = routing_service.compute_route("H1", "H4", routing_service.active_algorithm)
    assert route.status == "no_path"
