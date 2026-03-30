"""
Insert dummy BackendEvent data from CSV into the brain Postgres DB.

Usage:
    python insert_dummy_data.py

Requires:
    pip install psycopg2-binary

Make sure your DB is running (docker compose up brain-db) before running this.
"""

import csv
import json
import psycopg2
from datetime import datetime

DB_CONFIG = {
    "dbname": "braindb",
    "user": "brainuser",
    "password": "brainpass",
    "host": "localhost",
    "port": 5433,          # host-side port as mapped in docker-compose
}

CSV_FILE = "dummy_events.csv"

INSERT_SQL = """
INSERT INTO backend_event (
    event_id, event_time, event_date, project_id, agent_id, agent_session_id,
    path, method, status_code, latency_ms,
    request_size_bytes, response_size_bytes,
    request_headers, request_body, query_params, post_data,
    response_headers, response_body,
    request_content_type, response_content_type,
    custom_properties, error, metadata, created_at
) VALUES (
    %(event_id)s, %(event_time)s, %(event_date)s, %(project_id)s, %(agent_id)s, %(agent_session_id)s,
    %(path)s, %(method)s, %(status_code)s, %(latency_ms)s,
    %(request_size_bytes)s, %(response_size_bytes)s,
    %(request_headers)s, %(request_body)s, %(query_params)s, %(post_data)s,
    %(response_headers)s, %(response_body)s,
    %(request_content_type)s, %(response_content_type)s,
    %(custom_properties)s, %(error)s, %(metadata)s, %(created_at)s
)
ON CONFLICT (event_id) DO NOTHING;
"""

def parse_row(row):
    return {
        "event_id":               row["event_id"],
        "event_time":             datetime.strptime(row["event_time"], "%Y-%m-%d %H:%M:%S"),
        "event_date":             row["event_date"],
        "project_id":             row["project_id"],
        "agent_id":               row["agent_id"] or None,
        "agent_session_id":       row["agent_session_id"] or None,
        "path":                   row["path"],
        "method":                 row["method"],
        "status_code":            int(row["status_code"]),
        "latency_ms":             float(row["latency_ms"]),
        "request_size_bytes":     int(row["request_size_bytes"]),
        "response_size_bytes":    int(row["response_size_bytes"]),
        "request_headers":        row["request_headers"] or None,
        "request_body":           row["request_body"] or None,
        "query_params":           row["query_params"] or None,
        "post_data":              row["post_data"] or None,
        "response_headers":       row["response_headers"] or None,
        "response_body":          row["response_body"] or None,
        "request_content_type":   row["request_content_type"] or None,
        "response_content_type":  row["response_content_type"] or None,
        "custom_properties":      json.loads(row["custom_properties"]) if row["custom_properties"] else None,
        "error":                  row["error"] or None,
        "metadata":               json.loads(row["metadata"]) if row["metadata"] else None,
        "created_at":             datetime.strptime(row["created_at"], "%Y-%m-%d %H:%M:%S"),
    }

def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    inserted = 0
    skipped = 0

    with open(CSV_FILE, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                cur.execute(INSERT_SQL, parse_row(row))
                inserted += 1
            except Exception as e:
                print(f"  ✗ Skipped row {row['event_id']}: {e}")
                conn.rollback()
                skipped += 1
                continue

    conn.commit()
    cur.close()
    conn.close()

    print(f"\nDone — {inserted} inserted, {skipped} skipped.")

if __name__ == "__main__":
    main()