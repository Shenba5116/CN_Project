"""Abstract base class for NetResQ network adapters.

Ensures both the software simulation mode and real SDN controller mode provide
a uniform interface for topology querying, link status updates, metric injection, and flow control.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple, Any

from app.models import LinkModel, NodeModel, TopologyModel, LinkMetricsUpdateRequest


class NetworkAdapter(ABC):
    """Abstract interface for interacting with underlying network state."""

    @abstractmethod
    def get_topology(self) -> TopologyModel:
        """Returns the current network topology (nodes and links)."""
        pass

    @abstractmethod
    def fail_link(self, link_id: str) -> Tuple[bool, str]:
        """Fails the specified link. Returns (success, message)."""
        pass

    @abstractmethod
    def restore_link(self, link_id: str) -> Tuple[bool, str]:
        """Restores the specified link to healthy state. Returns (success, message)."""
        pass

    @abstractmethod
    def update_link_metrics(self, link_id: str, updates: LinkMetricsUpdateRequest) -> Tuple[bool, str]:
        """Updates latency, packet loss, or utilization for a link."""
        pass

    @abstractmethod
    def reset(self) -> Tuple[bool, str]:
        """Resets the topology to its default baseline state."""
        pass

    @abstractmethod
    def is_connected(self) -> bool:
        """Returns True if the underlying network source (or controller) is available."""
        pass

    @abstractmethod
    def get_adapter_info(self) -> Dict[str, Any]:
        """Returns diagnostic info about this adapter."""
        pass
