from math import isfinite

from flask import Flask, jsonify, request
from flask_cors import CORS

from planner import generate_study_plan

app = Flask(__name__)
CORS(app)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "message": "AdaptIQ backend is running"})


@app.post("/api/plan")
def create_plan():
    data = request.get_json(silent=True) or {}

    try:
        available_hours = float(data.get("availableHours", 0))
        topics = data.get("topics", [])

        if not isfinite(available_hours) or available_hours <= 0:
            return jsonify({"error": "Available study hours must be greater than zero."}), 400
        if not isinstance(topics, list) or not topics:
            return jsonify({"error": "Please add at least one active topic."}), 400
        if len(topics) > 12:
            return jsonify({"error": "Please add 12 topics or fewer for this demo."}), 400

        result = generate_study_plan(topics, available_hours)
        return jsonify(result)

    except (TypeError, ValueError, KeyError) as exc:
        return jsonify({"error": f"Please check your topic details: {exc}"}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)
