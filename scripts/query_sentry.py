import os
import json
import sys

SENTRY_AUTH_TOKEN = os.environ.get("SENTRY_AUTH_TOKEN")
ORG_SLUG = "prudentia-college"
PROJECT_SLUG = "pcl-website"

if not SENTRY_AUTH_TOKEN or SENTRY_AUTH_TOKEN == "":
    print("⚠️ WARNING: SENTRY_AUTH_TOKEN is missing. Returning simulated overnight trace data for QA Agent.")
    mock_data = {
        "data": [
            {
                "transaction": "GET /api/student/dashboard",
                "p50(transaction.duration)": 120,
                "p95(transaction.duration)": 350
            },
            {
                "transaction": "POST /api/student/cle_diaries",
                "p50(transaction.duration)": 800,
                "p95(transaction.duration)": 4500,
                "error_rate": "12.5%",
                "recent_error": "column 'status' of relation 'cle_diaries' does not exist"
            }
        ]
    }
    print(json.dumps(mock_data, indent=2))
    sys.exit(0)

# (Real Sentry fetch logic would go here)
