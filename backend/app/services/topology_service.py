"""Topology management service for NetResQ.

Coordinates access to the authoritative network adapter (simulation or real SDN).
"""

import logging
from typing import Dict, List, Optional, Tuple, Any

from app.adapters.base import NetworkAdapter
from app.adapters.simulation_adapter import SimulationAdapter
from app.adapters.sdn_controller_adapter import SDNControllerAdapter
from app.models import LinkModel, NodeModel, TopologyModel, LinkMetricsUpdateRequest

logger = logging.getLogger("netresq.topology")


class TopologyService:
    """Provides unified topology operations over the active network adapter."""

    def __init__(self):
        self._mode: str = "simulation"
        self._simulation_adapter = SimulationAdapter()
        self._sdn_adapter = SDNControllerAdapter()

    @property
    def mode(self) -> str:
        return self._mode

    def set_mode(self, mode: str) -> Tuple[bool, str]:
        """Switches active adapter between 'simulation' and 'sdn'."""
        mode_lower = mode.lower()
        if mode_lower not in ("simulation", "sdn"):
            return False, f"Invalid mode '{mode}'. Choose 'simulation' or 'sdn'."

        if mode_lower == "sdn":
            if not self._sdn_adapter.is_connected():
                return False, "Cannot switch to Real SDN mode: Controller is unreachable at http://127.0.0.1:8080."

        self._mode = mode_lower
        return True, f"Active mode switched to {mode_lower}."

    @property
    def active_adapter(self) -> NetworkAdapter:
        if self._mode == "sdn":
            return self._sdn_adapter
        return self._simulation_adapter

    def get_topology(self) -> TopologyModel:
        return self.active_adapter.get_topology()

    def get_nodes(self) -> List[NodeModel]:
        return self.get_topology().nodes

    def get_links(self) -> List[LinkModel]:
        return self.get_topology().links

    def fail_link(self, link_id: str) -> Tuple[bool, str]:
        return self.active_adapter.fail_link(link_id)

    def restore_link(self, link_id: str) -> Tuple[bool, str]:
        return self.active_adapter.restore_link(link_id)

    def update_link_metrics(self, link_id: str, updates: LinkMetricsUpdateRequest) -> Tuple[bool, str]:
        return self.active_adapter.update_link_metrics(link_id, updates)

    def reset_topology(self) -> Tuple[bool, str]:
        return self.active_adapter.reset()

    def is_controller_connected(self) -> bool:
        return self._sdn_adapter.is_connected()

    def get_controller_info(self) -> Dict[str, Any]:
        return self._sdn_adapter.get_adapter_info()


# Global singleton instance
topology_service = TopologyService()
