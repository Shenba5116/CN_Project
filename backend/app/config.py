"""Configuration module for NetResQ.
Defines default weights, network parameters, topology presets, and environment options.
"""

from typing import List, Dict, Any

# Server settings
API_HOST: str = "127.0.0.1"
API_PORT: int = 8000
CORS_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Quality-Aware Routing Algorithm Default Weights
# Formula:
#   normalized_latency = latency_ms / latency_reference_ms
#   normalized_loss = packet_loss_percent / 100
#   normalized_utilization = utilization_percent / 100
#   link_cost = (
#       configured_cost_weight * configured_cost
#       + latency_weight * normalized_latency
#       + loss_weight * normalized_loss
#       + utilization_weight * normalized_utilization
#   )
DEFAULT_CONFIGURED_COST_WEIGHT: float = 1.0
DEFAULT_LATENCY_WEIGHT: float = 1.0
DEFAULT_LOSS_WEIGHT: float = 2.0
DEFAULT_UTILIZATION_WEIGHT: float = 1.5
DEFAULT_LATENCY_REFERENCE_MS: float = 50.0

# Minimum positive cost per edge to guarantee valid Dijkstra traversal
MIN_EDGE_COST: float = 0.001

# Default Three-Switch Triangle Topology with 4 Attached Hosts
# Topology Structure:
#         [S1] (Top)
#        /    \
#       /      \
#    [S2] ---- [S3] (Base)
#
# Attached Hosts:
#    H1 -> S1
#    H2 -> S1
#    H3 -> S2
#    H4 -> S3
DEFAULT_NODES: List[Dict[str, Any]] = [
    {"id": "S1", "name": "Switch 1", "type": "switch", "dpid": "0000000000000001", "x": 350, "y": 80},
    {"id": "S2", "name": "Switch 2", "type": "switch", "dpid": "0000000000000002", "x": 180, "y": 320},
    {"id": "S3", "name": "Switch 3", "type": "switch", "dpid": "0000000000000003", "x": 520, "y": 320},
    {"id": "H1", "name": "Host 1", "type": "host", "ip": "10.0.0.1", "mac": "00:00:00:00:00:01", "x": 220, "y": 20},
    {"id": "H2", "name": "Host 2", "type": "host", "ip": "10.0.0.2", "mac": "00:00:00:00:00:02", "x": 480, "y": 20},
    {"id": "H3", "name": "Host 3", "type": "host", "ip": "10.0.0.3", "mac": "00:00:00:00:00:03", "x": 80, "y": 420},
    {"id": "H4", "name": "Host 4", "type": "host", "ip": "10.0.0.4", "mac": "00:00:00:00:00:04", "x": 620, "y": 420},
]

DEFAULT_LINKS: List[Dict[str, Any]] = [
    # Inter-switch triangle core links
    {
        "id": "L_S1_S2",
        "source": "S1",
        "target": "S2",
        "status": "up",
        "latency_ms": 5.0,
        "packet_loss_percent": 0.0,
        "utilization_percent": 15.0,
        "throughput_mbps": 100.0,
        "configured_cost": 1.0,
        "bandwidth_mbps": 1000.0,
        "is_core": True,
    },
    {
        "id": "L_S2_S3",
        "source": "S2",
        "target": "S3",
        "status": "up",
        "latency_ms": 6.0,
        "packet_loss_percent": 0.0,
        "utilization_percent": 10.0,
        "throughput_mbps": 100.0,
        "configured_cost": 1.0,
        "bandwidth_mbps": 1000.0,
        "is_core": True,
    },
    {
        "id": "L_S1_S3",
        "source": "S1",
        "target": "S3",
        "status": "up",
        "latency_ms": 7.0,
        "packet_loss_percent": 0.0,
        "utilization_percent": 20.0,
        "throughput_mbps": 100.0,
        "configured_cost": 1.0,
        "bandwidth_mbps": 1000.0,
        "is_core": True,
    },
    # Host access links (low baseline latency, 0 loss)
    {
        "id": "L_H1_S1",
        "source": "H1",
        "target": "S1",
        "status": "up",
        "latency_ms": 1.0,
        "packet_loss_percent": 0.0,
        "utilization_percent": 5.0,
        "throughput_mbps": 100.0,
        "configured_cost": 1.0,
        "bandwidth_mbps": 100.0,
        "is_core": False,
    },
    {
        "id": "L_H2_S1",
        "source": "H2",
        "target": "S1",
        "status": "up",
        "latency_ms": 1.0,
        "packet_loss_percent": 0.0,
        "utilization_percent": 5.0,
        "throughput_mbps": 100.0,
        "configured_cost": 1.0,
        "bandwidth_mbps": 100.0,
        "is_core": False,
    },
    {
        "id": "L_H3_S2",
        "source": "H3",
        "target": "S2",
        "status": "up",
        "latency_ms": 1.0,
        "packet_loss_percent": 0.0,
        "utilization_percent": 5.0,
        "throughput_mbps": 100.0,
        "configured_cost": 1.0,
        "bandwidth_mbps": 100.0,
        "is_core": False,
    },
    {
        "id": "L_H4_S3",
        "source": "H4",
        "target": "S3",
        "status": "up",
        "latency_ms": 1.0,
        "packet_loss_percent": 0.0,
        "utilization_percent": 5.0,
        "throughput_mbps": 100.0,
        "configured_cost": 1.0,
        "bandwidth_mbps": 100.0,
        "is_core": False,
    },
]
