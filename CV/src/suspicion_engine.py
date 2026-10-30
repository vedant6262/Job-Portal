"""Temporal, cooldown-aware rule-based suspicion scoring."""
import time
from config import EVENT_COOLDOWN_SECONDS, SCORE_RULES


class SuspicionEngine:
    def __init__(self):
        self.score = 0
        self.last_event = {}

    def reset(self):
        self.score, self.last_event = 0, {}

    def add(self, event_type, now=None):
        now = now or time.time()
        if now - self.last_event.get(event_type, 0) < EVENT_COOLDOWN_SECONDS:
            return 0
        contribution = SCORE_RULES.get(event_type, 0)
        self.score += contribution; self.last_event[event_type] = now
        return contribution

    def level(self):
        return "NORMAL" if self.score < 3 else "LOW SUSPICION" if self.score < 7 else "MEDIUM SUSPICION" if self.score < 12 else "HIGH SUSPICION"
