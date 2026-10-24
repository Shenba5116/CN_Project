"""Controller communication and diagnostics service for NetResQ.

Handles real SDN controller connection checking, LLDP topology discovery queries,
and status monitoring.
"""

from typing import Dict, Any
from app.services.topology_service import topology_service


class ControllerService:
    """Manages integration diagnostics with real OpenFlow/Ryu SDN controller."""

    def get_status(self) -> Dict[str, Any]:
        """Returns honest real-controller status."""
        return topology_service.get_controller_info()


# Global singleton instance
controller_service = ControllerService()
