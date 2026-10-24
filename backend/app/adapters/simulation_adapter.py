"""Simulation Network Adapter for NetResQ.

Provides an authoritative, in-memory simulated software network model.
Fully independent of Mininet or OpenFlow, allowing reliable demonstration
and testing on any development machine.
"""

import copy
import logging
from typing import Dict, List, Optional, Tuple, Any

from app.adapters.base import NetworkAdapter
from app.config import DEFAULT_NODES, DEFAULT_LINKS
from app.models import LinkModel, LinkStatus, NodeModel, TopologyModel, LinkMetricsUpdateRequest

logger = logging.getLogger("netresq.simulation")


class SimulationAdapter(NetworkAdapter):
    """In-memory simulation adapter for NetResQ network topology and link states."""

    def __init__(self):
        self._nodes: Dict[str, NodeModel] = {}
        self._links: Dict[str, LinkModel] = {}
        self._reset_to_defaults()

    def _reset_to_defaults(self):
        self._nodes.clear()
        self._links.clear()

        for n in DEFAULT_NODES:
            self._nodes[n["id"]] = NodeModel(**n)

        for l in DEFAULT_LINKS:
            self._links[l["id"]] = LinkModel(**l)

    def get_topology(self) -> TopologyModel:
        """Returns snapshot of current nodes and links."""
        return TopologyModel(
            nodes=list(self._nodes.values()),
            links=list(self._links.values())
        )

    def fail_link(self, link_id: str) -> Tuple[bool, str]:
        """Marks a link as DOWN."""
        if link_id not in self._links:
            return False, f"Link '{link_id}' not found in topology."
        
        link = self._links[link_id]
        if link.status == LinkStatus.DOWN:
            return False, f"Link '{link_id}' is already down."

        # Update link status
        updated_link = link.model_copy(update={"status": LinkStatus.DOWN})
        self._links[link_id] = updated_link
        logger.info(f"Link {link_id} failed.")
        return True, f"Link '{link_id}' ({link.source} <-> {link.target}) has been marked as DOWN."

    def restore_link(self, link_id: str) -> Tuple[bool, str]:
        """Restores a link to healthy UP status."""
        if link_id not in self._links:
            return False, f"Link '{link_id}' not found in topology."

        link = self._links[link_id]
        # Determine if metrics warrant degraded or clean up
        new_status = LinkStatus.UP
        if link.packet_loss_percent > 15.0 or link.latency_ms > 40.0 or link.utilization_percent > 80.0:
            new_status = LinkStatus.DEGRADED

        updated_link = link.model_copy(update={"status": new_status})
        self._links[link_id] = updated_link
        logger.info(f"Link {link_id} restored to {new_status}.")
        return True, f"Link '{link_id}' ({link.source} <-> {link.target}) restored to {new_status.value.upper()}."

    def update_link_metrics(self, link_id: str, updates: LinkMetricsUpdateRequest) -> Tuple[bool, str]:
        """Updates latency, packet loss, or utilization for a link."""
        if link_id not in self._links:
            return False, f"Link '{link_id}' not found in topology."

        link = self._links[link_id]
        new_values = {}
        if updates.latency_ms is not None:
            new_values["latency_ms"] = float(updates.latency_ms)
        if updates.packet_loss_percent is not None:
            new_values["packet_loss_percent"] = float(updates.packet_loss_percent)
        if updates.utilization_percent is not None:
            new_values["utilization_percent"] = float(updates.utilization_percent)
        if updates.throughput_mbps is not None:
            new_values["throughput_mbps"] = float(updates.throughput_mbps)

        # Check if status should update to DEGRADED or UP (if not currently DOWN)
        if link.status != LinkStatus.DOWN:
            lat = new_values.get("latency_ms", link.latency_ms)
            loss = new_values.get("packet_loss_percent", link.packet_loss_percent)
            util = new_values.get("utilization_percent", link.utilization_percent)
            if loss > 15.0 or lat > 40.0 or util > 80.0:
                new_values["status"] = LinkStatus.DEGRADED
            else:
                new_values["status"] = LinkStatus.UP

        updated_link = link.model_copy(update=new_values)
        self._links[link_id] = updated_link
        return True, f"Link '{link_id}' metrics updated successfully."

    def reset(self) -> Tuple[bool, str]:
        """Resets topology to clean baseline."""
        self._reset_to_defaults()
        logger.info("Simulation topology reset to default.")
        return True, "Simulation topology successfully restored to initial baseline state."

    def is_connected(self) -> bool:
        return True

    def get_adapter_info(self) -> Dict[str, Any]:
        return {
            "type": "simulation",
            "description": "In-memory Software Emulation Engine (NetResQ Virtual Graph)",
            "connected": True,
            "switches": len([n for n in self._nodes.values() if n.type == "switch"]),
            "hosts": len([n for n in self._nodes.values() if n.type == "host"]),
            "links": len(self._links)
        }
