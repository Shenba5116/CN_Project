"""Pydantic data models for NetResQ.
Defines schemas for nodes, links, topologies, routing requests, metrics, and events.
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


class NodeType(str, Enum):
    SWITCH = "switch"
    HOST = "host"


class LinkStatus(str, Enum):
    UP = "up"
    DOWN = "down"
    DEGRADED = "degraded"


class RoutingAlgorithm(str, Enum):
    SHORTEST_PATH = "shortest_path"
    QUALITY_AWARE = "quality_aware"


class EventSeverity(str, Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"


class NodeModel(BaseModel):
    id: str = Field(..., description="Unique node identifier, e.g. S1 or H1")
    name: str = Field(..., description="Human-friendly node label")
    type: NodeType = Field(..., description="Type of node: switch or host")
    dpid: Optional[str] = Field(None, description="OpenFlow datapath ID for switches")
    ip: Optional[str] = Field(None, description="IP address for hosts")
    mac: Optional[str] = Field(None, description="MAC address for hosts")
    x: float = Field(0.0, description="X coordinate for topology display")
    y: float = Field(0.0, description="Y coordinate for topology display")


class LinkModel(BaseModel):
    id: str = Field(..., description="Unique link identifier, e.g. L_S1_S2")
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    status: LinkStatus = Field(LinkStatus.UP, description="Link health status")
    latency_ms: float = Field(..., ge=0.0, description="Measured or simulated latency in milliseconds")
    packet_loss_percent: float = Field(..., ge=0.0, le=100.0, description="Packet loss percentage [0-100]")
    utilization_percent: float = Field(..., ge=0.0, le=100.0, description="Link bandwidth utilization percentage [0-100]")
    throughput_mbps: float = Field(100.0, ge=0.0, description="Throughput in Mbps")
    configured_cost: float = Field(1.0, ge=0.0, description="Administrative baseline cost")
    bandwidth_mbps: float = Field(1000.0, ge=0.0, description="Link bandwidth capacity in Mbps")
    is_core: bool = Field(True, description="True for inter-switch core links, False for host edge links")

    @field_validator("status", mode="before")
    @classmethod
    def compute_status(cls, v: Any, info: Any) -> Any:
        return v


class TopologyModel(BaseModel):
    nodes: List[NodeModel]
    links: List[LinkModel]


class WeightConfigModel(BaseModel):
    configured_cost_weight: float = Field(1.0, ge=0.0, description="Weight for administrative cost")
    latency_weight: float = Field(1.0, ge=0.0, description="Weight for normalized latency")
    loss_weight: float = Field(2.0, ge=0.0, description="Weight for normalized packet loss")
    utilization_weight: float = Field(1.5, ge=0.0, description="Weight for normalized utilization")
    latency_reference_ms: float = Field(50.0, gt=0.0, description="Reference latency for normalization (ms)")

    @field_validator("latency_reference_ms")
    @classmethod
    def validate_reference(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("latency_reference_ms must be strictly positive")
        return v


class RouteHop(BaseModel):
    node_id: str
    node_type: NodeType
    next_link_id: Optional[str] = None
    link_cost: Optional[float] = None


class RouteRequest(BaseModel):
    source: str = Field(..., description="Source host or switch ID")
    destination: str = Field(..., description="Destination host or switch ID")
    algorithm: RoutingAlgorithm = Field(RoutingAlgorithm.QUALITY_AWARE, description="Routing algorithm to compute")


class RouteResultModel(BaseModel):
    source: str
    destination: str
    algorithm: RoutingAlgorithm
    path: List[str] = Field(default_factory=list, description="Ordered node IDs from source to destination")
    switches: List[str] = Field(default_factory=list, description="Ordered switches traversed")
    links: List[str] = Field(default_factory=list, description="Ordered link IDs traversed")
    total_cost: float = Field(0.0, description="Computed total route cost")
    hop_count: int = Field(0, description="Total hops in path")
    computation_time_ms: float = Field(0.0, description="Route computation time in milliseconds")
    per_link_costs: Dict[str, float] = Field(default_factory=dict, description="Calculated cost for each link on the path")
    per_link_metrics: Dict[str, Dict[str, float]] = Field(default_factory=dict, description="Metrics breakdown for each link")
    explanation: str = Field("", description="Clear human-readable explanation of why this path was chosen")
    status: str = Field("found", description="'found', 'no_path', or 'error'")


class ComparisonResultModel(BaseModel):
    source: str
    destination: str
    baseline_route: RouteResultModel
    quality_aware_route: RouteResultModel
    cost_difference: float
    paths_differ: bool
    explanation: str


class LinkMetricsUpdateRequest(BaseModel):
    latency_ms: Optional[float] = Field(None, ge=0.0, le=1000.0, description="New latency in ms")
    packet_loss_percent: Optional[float] = Field(None, ge=0.0, le=100.0, description="New packet loss %")
    utilization_percent: Optional[float] = Field(None, ge=0.0, le=100.0, description="New utilization %")
    throughput_mbps: Optional[float] = Field(None, ge=0.0, description="New throughput in Mbps")


class NetworkEventModel(BaseModel):
    id: str
    timestamp: str
    event_type: str
    severity: EventSeverity
    message: str
    details: Optional[Dict[str, Any]] = None


class SystemStatusModel(BaseModel):
    mode: str = Field("simulation", description="'simulation' or 'sdn'")
    backend_online: bool = True
    controller_connected: bool = False
    controller_url: Optional[str] = None
    switches_count: int = 3
    hosts_count: int = 4
    healthy_links_count: int = 7
    failed_links_count: int = 0
    degraded_links_count: int = 0
    active_algorithm: RoutingAlgorithm = RoutingAlgorithm.QUALITY_AWARE
    active_source: str = "H1"
    active_destination: str = "H4"
    last_updated: str
