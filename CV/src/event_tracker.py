"""Track sustained events without producing one record per video frame."""
import time


class EventTracker:
    def __init__(self):
        self.active = {}

    def update(self, event_type, present, confidence=None, minimum_duration=0.0):
        now = time.time()
        if present and event_type not in self.active:
            self.active[event_type] = {"start": now, "confidence": confidence, "reported": False}
        if present and event_type in self.active:
            event = self.active[event_type]
            if not event["reported"] and now - event["start"] >= minimum_duration:
                event["reported"] = True
                return dict(event, end=now, duration=now - event["start"])
        if not present and event_type in self.active:
            event = self.active.pop(event_type); event["end"] = now
            event["duration"] = now - event["start"]; event.pop("reported", None); return event
        return None

    def finish(self):
        now = time.time(); events = []
        for event_type in list(self.active):
            event = self.active.pop(event_type); event["end"] = now
            event["duration"] = now - event["start"]; event.pop("reported", None)
            events.append((event_type, event))
        return events
