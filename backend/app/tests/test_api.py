"""API Endpoint Integration Tests using FastAPI TestClient."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "NetResQ" in data["service"]


def test_api_status():
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert data["backend_online"] is True
    assert data["switches_count"] == 3
    assert data["hosts_count"] == 4


def test_api_topology():
    response = client.get("/api/topology")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "links" in data
    assert len(data["nodes"]) == 7
    assert len(data["links"]) == 7


def test_api_compute_route():
    req = {
        "source": "H1",
        "destination": "H4",
        "algorithm": "quality_aware"
    }
    response = client.post("/api/routes/compute", json=req)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "found"
    assert data["source"] == "H1"
    assert data["destination"] == "H4"
    assert len(data["path"]) >= 2


def test_api_link_failure_and_restoration():
    # 1. Fail link
    fail_res = client.post("/api/links/L_S1_S2/fail")
    assert fail_res.status_code == 200
    fail_data = fail_res.json()
    assert fail_data["success"] is True

    # 2. Verify in topology
    topo_res = client.get("/api/topology")
    link = next(l for l in topo_res.json()["links"] if l["id"] == "L_S1_S2")
    assert link["status"] == "down"

    # 3. Restore link
    restore_res = client.post("/api/links/L_S1_S2/restore")
    assert restore_res.status_code == 200
    restore_data = restore_res.json()
    assert restore_data["success"] is True


def test_api_invalid_link_id():
    fail_res = client.post("/api/links/NONEXISTENT_LINK/fail")
    assert fail_res.status_code == 400


def test_api_weights():
    # Get current weights
    get_res = client.get("/api/weights")
    assert get_res.status_code == 200
    orig_weights = get_res.json()

    # Update weights
    new_weights = orig_weights.copy()
    new_weights["loss_weight"] = 3.5
    post_res = client.post("/api/weights", json=new_weights)
    assert post_res.status_code == 200
    assert post_res.json()["loss_weight"] == 3.5

    # Reset simulation
    client.post("/api/simulation/reset")
