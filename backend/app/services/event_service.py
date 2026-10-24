"""Event logging service for NetResQ.

Maintains an in-memory chronological event stream of topology modifications,
link failures, recoveries, routing recalculations, and system state transitions.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid

from app.models import EventSeverity, NetworkEventModel


class EventService:
    """Manages the network operations event log."""

    def __init__(self, max_events: int = 200):
        self._events: List[NetworkEventModel] = []
        self._max_events = max_events

        # Initialize with startup event
        self.log_event(
            event_type="SYSTEM_STARTUP",
            severity=EventSeverity.INFO,
            message="NetResQ Self-Healing Network Engine initialized in Simulation Mode.",
            details={"topology": "3-Switch Triangle Core with 4 Attached Hosts"}
        )

    def log_event(
        self,
        event_type: str,
        severity: EventSeverity,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ) -> NetworkEventModel:
        """Appends a new event with UTC timestamp."""
        event = NetworkEventModel(
            id=str(uuid.uuid4())[:8],
            timestamp=datetime.now(timezone.utc).isoformat(),
            event_type=event_type,
            severity=severity,
            message=message,
            details=details or {}
        )
        self._events.insert(0, event)  # Store in reverse chronological order
        if len(self._events) > self._max_events:
            self._events.pop()
        return event

    def get_events(
        self,
        limit: int = 50,
        severity: Optional[EventSeverity] = None
    ) -> List[NetworkEventModel]:
        """Returns recent events, optionally filtered by severity."""
        if severity:
            filtered = [e for e in self._events if e.severity == severity]
            return filtered[:limit]
        return self._events[:limit]

    def clear(self) -> None:
        """Clears displayed event history."""
        self._events.clear()
        self.log_event(
            event_type="LOG_CLEARED",
            severity=EventSeverity.INFO,
            message="Event history cleared by operator."
        )


# Global singleton instance
event_service = EventService()
