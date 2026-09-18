def calculate_trip_budget(preferences: dict, selected_places: list) -> dict:
    """
    Computes an itemized cost estimate for the trip and compares it against the user's budget.
    """
    num_days = max(1, int(preferences.get('num_days', 3)))
    user_budget = float(preferences.get('budget', 15000))
    travel_type = preferences.get('travel_type', 'Friends')

    # Activity/Entry costs from selected database places
    activities_cost = sum(float(getattr(p, 'estimated_cost', 500)) for p in selected_places)

    # Per-day accommodation estimate according to travel companion type
    if travel_type == 'Solo':
        daily_stay = 1200.0
        daily_food = 700.0
        daily_transport = 600.0
    elif travel_type == 'Couple':
        daily_stay = 2500.0
        daily_food = 1200.0
        daily_transport = 900.0
    elif travel_type == 'Family':
        daily_stay = 3200.0
        daily_food = 1500.0
        daily_transport = 1100.0
    else:  # Friends
        daily_stay = 1800.0
        daily_food = 1000.0
        daily_transport = 800.0

    num_nights = max(1, num_days - 1)
    accommodation_cost = round(daily_stay * num_nights, 2)
    food_cost = round(daily_food * num_days, 2)
    transport_cost = round(daily_transport * num_days, 2)
    misc_cost = round((accommodation_cost + food_cost + transport_cost + activities_cost) * 0.05, 2)

    total_estimated = round(accommodation_cost + food_cost + transport_cost + activities_cost + misc_cost, 2)
    remaining_balance = round(user_budget - total_estimated, 2)

    if total_estimated > user_budget:
        status = 'exceeded'
        status_message = "Your estimated trip cost exceeds your target budget."
    elif remaining_balance >= user_budget * 0.2:
        status = 'economical'
        status_message = "Well within budget! You have comfortable extra margin."
    else:
        status = 'on_track'
        status_message = "Optimal fit for your budget!"

    suggestions = []
    if status == 'exceeded':
        suggestions = [
            "Consider eco-homestays or local guesthouses instead of luxury hotels.",
            "Use shared cabs or local state transport for inter-city travel.",
            "Focus on free access historical sites and natural viewpoints on peak days."
        ]

    return {
        'accommodation': accommodation_cost,
        'transportation': transport_cost,
        'food': food_cost,
        'activities': round(activities_cost, 2),
        'miscellaneous': misc_cost,
        'total_estimated': total_estimated,
        'user_budget': round(user_budget, 2),
        'remaining_balance': remaining_balance,
        'status': status,
        'status_message': status_message,
        'suggestions': suggestions,
    }
