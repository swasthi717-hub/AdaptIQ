
from heapq import heappush, heappop
from itertools import count
from math import isfinite


def priority_score(topic, all_topics):
    """
    Calculate topic priority using:
    50% deadline urgency
    30% difficulty
    20% shorter study duration
    """

    urgency_values = [
        1 / (float(t["daysLeft"]) + 1)
        for t in all_topics
    ]

    duration_values = [
        1 / float(t["duration"])
        for t in all_topics
    ]

    urgency = (
        (1 / (float(topic["daysLeft"]) + 1))
        / max(urgency_values)
    )

    difficulty = int(topic["difficulty"]) / 5

    shorter_duration = (
        (1 / float(topic["duration"]))
        / max(duration_values)
    )

    return round(
        0.50 * urgency
        + 0.30 * difficulty
        + 0.20 * shorter_duration,
        4
    )


def heuristic(state, topics, scores):
    """
    GBFS heuristic for a partial schedule.

    State:
        (ordered topic indexes, remaining study hours)

    The heuristic estimates the priority score of topics
    that can still fit into the remaining study time.

    GBFS selects the state with the lowest heuristic value.
    This is a greedy search strategy, not an optimality guarantee.
    """

    chosen = set(state[0])
    remaining = state[1]

    return sum(
        scores[i]
        for i, topic in enumerate(topics)
        if i not in chosen
        and float(topic["duration"]) <= remaining
    )


def generate_study_plan(topics, available_hours):
    """
    Generate a personalised study schedule using
    Greedy Best-First Search.
    """

    # Validate available study hours
    try:
        available_hours = float(available_hours)
    except (TypeError, ValueError):
        raise ValueError("Available study hours must be a valid number.")

    if not isfinite(available_hours) or available_hours <= 0:
        raise ValueError("Available study hours must be greater than zero.")

    if not isinstance(topics, list):
        raise ValueError("Topics must be provided as a list.")

    if not topics:
        raise ValueError("Please add at least one topic.")

    # Validate and clean topic details
    cleaned = []

    for item in topics:
        if not isinstance(item, dict):
            raise ValueError("Each topic must be a valid object.")

        try:
            duration = float(item["duration"])
            difficulty = int(item["difficulty"])
            days_left = int(item["daysLeft"])
        except (KeyError, TypeError, ValueError):
            raise ValueError("Please check your topic details.")

        if not isfinite(duration) or duration <= 0:
            raise ValueError("Topic duration must be greater than zero.")

        if not 1 <= difficulty <= 5:
            raise ValueError("Difficulty must be between 1 and 5.")

        if days_left < 0:
            raise ValueError("Days until deadline cannot be negative.")

        cleaned.append({
            "id": item.get("id"),
            "subject": str(item.get("subject", "")).strip() or "General",
            "topic": str(item.get("topic", "")).strip() or "Untitled topic",
            "duration": duration,
            "difficulty": difficulty,
            "daysLeft": days_left
        })

    # Calculate priority scores for all topics
    scores = [
        priority_score(topic, cleaned)
        for topic in cleaned
    ]

    # Initialise the GBFS frontier
    frontier = []
    sequence = count()

    start = (
        tuple(),
        round(available_hours, 2)
    )

    start_h = heuristic(start, cleaned, scores)

    heappush(
        frontier,
        (start_h, next(sequence), start)
    )

    visited = set()
    expanded = 0

    # Greedy Best-First Search
    while frontier:

        _, _, state = heappop(frontier)

        chosen, remaining = state

        key = frozenset(chosen)

        if key in visited:
            continue

        visited.add(key)
        expanded += 1

        chosen_set = set(chosen)

        # Find topics that can fit into the remaining time
        possible = [
            i
            for i, topic in enumerate(cleaned)
            if i not in chosen_set
            and topic["duration"] <= remaining
        ]

        # Goal state: no more topics can fit
        if not possible:

            planned = []

            for index in chosen:
                item = dict(cleaned[index])
                item["priority"] = scores[index]
                planned.append(item)

            total = round(
                sum(topic["duration"] for topic in planned),
                2
            )

            not_planned = [
                {
                    "id": topic["id"],
                    "subject": topic["subject"],
                    "topic": topic["topic"],
                    "duration": topic["duration"]
                }
                for i, topic in enumerate(cleaned)
                if i not in chosen_set
            ]

            return {
                "plan": planned,
                "notScheduled": not_planned,
                "availableHours": round(available_hours, 2),
                "plannedHours": total,
                "remainingHours": round(
                    available_hours - total,
                    2
                ),
                "statesExpanded": expanded
            }

        # Expand the current state
        for index in possible:

            next_chosen = chosen + (index,)

            next_remaining = round(
                remaining - cleaned[index]["duration"],
                2
            )

            next_state = (
                next_chosen,
                next_remaining
            )

            next_key = frozenset(next_chosen)

            if next_key not in visited:

                h = heuristic(
                    next_state,
                    cleaned,
                    scores
                )

                heappush(
                    frontier,
                    (h, next(sequence), next_state)
                )

    # Fallback result
    return {
        "plan": [],
        "notScheduled": [
            {
                "id": topic["id"],
                "subject": topic["subject"],
                "topic": topic["topic"],
                "duration": topic["duration"]
            }
            for topic in cleaned
        ],
        "availableHours": round(available_hours, 2),
        "plannedHours": 0,
        "remainingHours": round(available_hours, 2),
        "statesExpanded": expanded
    }
