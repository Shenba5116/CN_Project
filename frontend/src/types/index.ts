export type NodeType = 'switch' | 'host';
export type LinkStatus = 'up' | 'down' | 'degraded';
export type RoutingAlgorithm = 'shortest_path' | 'quality_aware';
export type EventSeverity = 'info' | 'success' | 'warning' | 'error';

export interface NodeModel {
  id: string;
  name: string;
  type: NodeType;
  dpid?: string;
  ip?: string;
  mac?: string;
  x: number;
  y: number;
}

export interface LinkModel {
  id: string;
  source: string;
  target: string;
  status: LinkStatus;
  latency_ms: number;
  packet_loss_percent: number;
  utilization_percent: number;
  throughput_mbps: number;
  configured_cost: number;
  bandwidth_mbps: number;
  is_core: boolean;
}

export interface TopologyModel {
  nodes: NodeModel[];
  links: LinkModel[];
}

export interface WeightConfig {
  configured_cost_weight: number;
  latency_weight: number;
  loss_weight: number;
  utilization_weight: number;
  latency_reference_ms: number;
}

export interface RouteResult {
  source: string;
  destination: string;
  algorithm: RoutingAlgorithm;
  path: string[];
  switches: string[];
  links: string[];
  total_cost: number;
  hop_count: number;
  computation_time_ms: number;
  per_link_costs: Record<string, number>;
  per_link_metrics: Record<string, {
    latency_ms: number;
    packet_loss_percent: number;
    utilization_percent: number;
    configured_cost?: number;
    calculated_cost?: number;
  }>;
  explanation: string;
  status: 'found' | 'no_path' | 'error';
}

export interface ComparisonResult {
  source: string;
  destination: string;
  baseline_route: RouteResult;
  quality_aware_route: RouteResult;
  cost_difference: number;
  paths_differ: boolean;
  explanation: string;
}

export interface NetworkEvent {
  id: string;
  timestamp: string;
  event_type: string;
  severity: EventSeverity;
  message: string;
  details?: Record<string, any>;
}

export interface SystemStatus {
  mode: 'simulation' | 'sdn';
  backend_online: boolean;
  controller_connected: boolean;
  controller_url?: string;
  switches_count: number;
  hosts_count: number;
  healthy_links_count: number;
  failed_links_count: number;
  degraded_links_count: number;
  active_algorithm: RoutingAlgorithm;
  active_source: string;
  active_destination: string;
  last_updated: string;
}

export interface TelemetrySnapshot {
  time: string;
  avg_latency: number;
  avg_loss: number;
  avg_utilization: number;
  health_score: number;
}

export interface MetricsSummary {
  switches_count: number;
  hosts_count: number;
  total_links: number;
  healthy_links_count: number;
  failed_links_count: number;
  degraded_links_count: number;
  average_latency_ms: number;
  average_packet_loss_percent: number;
  average_utilization_percent: number;
  network_health_score: number;
  history: TelemetrySnapshot[];
}

export interface LinkMetricsUpdate {
  latency_ms?: number;
  packet_loss_percent?: number;
  utilization_percent?: number;
  throughput_mbps?: number;
}
