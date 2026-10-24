import type {
  TopologyModel,
  RouteResult,
  ComparisonResult,
  NetworkEvent,
  SystemStatus,
  MetricsSummary,
  WeightConfig,
  LinkMetricsUpdate,
  RoutingAlgorithm
} from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData.detail) {
            errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }
      return await response.json();
    } catch (err: any) {
      console.error(`API Request failed [${endpoint}]:`, err);
      throw err;
    }
  }

  // Health and Status
  async getHealth(): Promise<{ status: string; service: string; timestamp: string }> {
    return this.request('/health');
  }

  async getStatus(): Promise<SystemStatus> {
    return this.request<SystemStatus>('/status');
  }

  // Topology
  async getTopology(): Promise<TopologyModel> {
    return this.request<TopologyModel>('/topology');
  }

  // Metrics
  async getMetrics(): Promise<MetricsSummary> {
    return this.request<MetricsSummary>('/metrics');
  }

  // Events
  async getEvents(limit: number = 50, severity?: string): Promise<NetworkEvent[]> {
    const query = new URLSearchParams();
    query.set('limit', limit.toString());
    if (severity) query.set('severity', severity);
    return this.request<NetworkEvent[]>(`/events?${query.toString()}`);
  }

  async clearEvents(): Promise<{ success: boolean; message: string }> {
    return this.request('/events/clear', { method: 'POST' });
  }

  // Routing
  async getActiveRoute(): Promise<RouteResult> {
    return this.request<RouteResult>('/routes');
  }

  async computeRoute(source: string, destination: string, algorithm: RoutingAlgorithm): Promise<RouteResult> {
    return this.request<RouteResult>('/routes/compute', {
      method: 'POST',
      body: JSON.stringify({ source, destination, algorithm }),
    });
  }

  async getComparison(source?: string, destination?: string): Promise<ComparisonResult> {
    const query = new URLSearchParams();
    if (source) query.set('source', source);
    if (destination) query.set('destination', destination);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<ComparisonResult>(`/comparison${qs}`);
  }

  // Link controls
  async failLink(linkId: string): Promise<any> {
    return this.request(`/links/${encodeURIComponent(linkId)}/fail`, { method: 'POST' });
  }

  async restoreLink(linkId: string): Promise<any> {
    return this.request(`/links/${encodeURIComponent(linkId)}/restore`, { method: 'POST' });
  }

  async updateLinkMetrics(linkId: string, updates: LinkMetricsUpdate): Promise<any> {
    return this.request(`/links/${encodeURIComponent(linkId)}/metrics`, {
      method: 'POST',
      body: JSON.stringify(updates),
    });
  }

  // Simulation controls
  async resetSimulation(): Promise<any> {
    return this.request('/simulation/reset', { method: 'POST' });
  }

  async injectCongestion(): Promise<any> {
    return this.request('/simulation/congestion', { method: 'POST' });
  }

  // Routing Weights
  async getWeights(): Promise<WeightConfig> {
    return this.request<WeightConfig>('/weights');
  }

  async updateWeights(weights: WeightConfig): Promise<WeightConfig> {
    return this.request<WeightConfig>('/weights', {
      method: 'POST',
      body: JSON.stringify(weights),
    });
  }

  // Mode Switch
  async switchMode(mode: 'simulation' | 'sdn'): Promise<any> {
    return this.request(`/mode?mode=${encodeURIComponent(mode)}`, { method: 'POST' });
  }

  // Controller diagnostics
  async getControllerStatus(): Promise<any> {
    return this.request('/controller/status');
  }
}

export const api = new ApiService();
