"""Generate neutral JSON and CSV examination reports."""
import csv
import json
from collections import Counter
from config import REPORTS_DIR, ensure_directories


def generate_report(session_id, start, end, duration, score, level, events):
    ensure_directories()
    report = {"session_id": session_id, "start": start, "end": end, "duration_seconds": duration,
              "max_suspicion_score": score, "final_suspicion_level": level,
              "event_counts": dict(Counter(event["type"] for event in events)), "events": events,
              "summary": "Automated detections are review aids and do not establish that cheating occurred."}
    (REPORTS_DIR / f"{session_id}.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    with (REPORTS_DIR / f"{session_id}.csv").open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=["type", "start", "end", "duration", "confidence", "contribution"])
        writer.writeheader()
        writer.writerows({key: event.get(key) for key in writer.fieldnames} for event in events)
    return report
