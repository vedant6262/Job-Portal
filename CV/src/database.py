"""SQLite and CSV persistence for examination sessions and events."""
import csv
import sqlite3
from config import CSV_LOG_PATH, DATABASE_PATH, ensure_directories


class Database:
    def __init__(self):
        ensure_directories(); self.connection = sqlite3.connect(DATABASE_PATH)
        self.connection.execute("CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, start TEXT, end TEXT, duration REAL, max_score INTEGER, level TEXT)")
        self.connection.execute("CREATE TABLE IF NOT EXISTS events (session_id TEXT, type TEXT, start TEXT, end TEXT, duration REAL, confidence REAL, contribution INTEGER, description TEXT)")
        self.connection.commit()
        if not CSV_LOG_PATH.exists():
            CSV_LOG_PATH.write_text("session_id,timestamp,event_type,duration,confidence,score_contribution,description\n", encoding="utf-8")

    def session(self, session_id, start):
        self.connection.execute("INSERT INTO sessions(id,start) VALUES (?,?)", (session_id, start)); self.connection.commit()

    def event(self, session_id, event):
        values = (session_id, event["type"], event["start"], event["end"], event["duration"], event.get("confidence"), event.get("contribution", 0), event.get("description", ""))
        self.connection.execute("INSERT INTO events VALUES (?,?,?,?,?,?,?,?)", values); self.connection.commit()
        with CSV_LOG_PATH.open("a", newline="", encoding="utf-8") as file:
            csv.writer(file).writerow((session_id, event["start"], *values[1:]))

    def finish(self, session_id, end, duration, score, level):
        self.connection.execute("UPDATE sessions SET end=?,duration=?,max_score=?,level=? WHERE id=?", (end, duration, score, level, session_id)); self.connection.commit()

    def close(self):
        self.connection.close()
