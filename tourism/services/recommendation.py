from django.db.models import Q
from tourism.models import TouristPlace


def score_place_for_user(place: TouristPlace, preferences: dict) -> dict:
    """
    Calculates a weighted compatibility score (0 to 100) for a given place against user preferences.

    Weights:
    - Interest match: 35%
    - Budget compatibility: 20%
    - Duration compatibility: 15%
    - Destination relevance: 15%
    - Travel type suitability: 10%
    - Quality / Rating: 5%
    """
    user_interests = [i.lower() for i in preferences.get('interests', [])]
    user_budget = float(preferences.get('budget', 15000))
    user_days = max(1, int(preferences.get('num_days', 3)))
    user_dest = preferences.get('destination', '').strip().lower()
    user_travel_type = preferences.get('travel_type', 'Friends').lower()
    prefer_hidden = preferences.get('prefer_hidden_gems', False)

    reasons = []

    # 1. Destination Relevance (15%)
    dest_score = 0.0
    place_state = place.state.lower()
    place_city = place.city.lower()
    place_name = place.name.lower()

    if user_dest:
        if user_dest in place_state or user_dest in place_city or user_dest in place_name:
            dest_score = 1.0
            reasons.append(f"Located in {place.city}, {place.state}")
        elif place_state in user_dest or place_city in user_dest:
            dest_score = 0.9
            reasons.append(f"State match ({place.state})")
        else:
            dest_score = 0.3
    else:
        dest_score = 0.8  # No filter = general match

    # 2. Interest Match (35%)
    place_tags = [t.lower() for t in place.tag_list]
    place_category = place.category.lower()

    matches = 0
    matched_interests = []

    for interest in user_interests:
        if interest in place_category or any(interest in tag for tag in place_tags):
            matches += 1
            matched_interests.append(interest.title())

    if user_interests:
        interest_score = min(1.0, (matches / len(user_interests)) * 1.2 if matches > 0 else 0.1)
    else:
        interest_score = 0.5

    if matched_interests:
        reasons.append(f"Matches {', '.join(matched_interests[:3])}")

    # 3. Budget Compatibility (20%)
    daily_budget = user_budget / user_days
    # If place entry/activity cost is reasonable relative to daily budget
    if place.estimated_cost <= daily_budget * 0.4:
        budget_score = 1.0
        reasons.append("Great budget fit")
    elif place.estimated_cost <= daily_budget * 0.8:
        budget_score = 0.8
    elif place.estimated_cost <= daily_budget:
        budget_score = 0.6
    else:
        budget_score = 0.3

    # 4. Duration Compatibility (15%)
    # Place duration vs total available trip time
    total_trip_hours = user_days * 8.0  # ~8 active hours per day
    if place.recommended_duration <= total_trip_hours * 0.4:
        duration_score = 1.0
    elif place.recommended_duration <= total_trip_hours * 0.7:
        duration_score = 0.8
    else:
        duration_score = 0.4

    # 5. Travel Type Suitability (10%)
    travel_type_score = 0.7  # default baseline
    if user_travel_type == 'solo' and any(t in ['nature', 'spirituality', 'adventure', 'relaxation'] for t in place_tags):
        travel_type_score = 1.0
    elif user_travel_type == 'family' and any(t in ['heritage', 'culture', 'nature', 'spiritual'] for t in place_tags):
        travel_type_score = 1.0
    elif user_travel_type == 'couple' and any(t in ['nature', 'beach', 'hill station', 'relaxation'] for t in place_tags):
        travel_type_score = 1.0
    elif user_travel_type == 'friends' and any(t in ['adventure', 'beach', 'food', 'heritage'] for t in place_tags):
        travel_type_score = 1.0

    # 6. Rating & Hidden Gem Bonus (10%)
    rating_score = (place.rating / 5.0)
    hidden_gem_bonus = 0.12 if (prefer_hidden and place.is_hidden_gem) else (0.06 if place.is_hidden_gem else 0.0)

    if place.is_hidden_gem:
        reasons.append("Hidden Gem Destination ✨")

    # Weighted final score calculation
    final_score = (
        (interest_score * 0.35) +
        (budget_score * 0.20) +
        (duration_score * 0.15) +
        (dest_score * 0.15) +
        (travel_type_score * 0.10) +
        (rating_score * 0.05) +
        hidden_gem_bonus
    )

    match_percentage = round(min(100.0, max(40.0, final_score * 100.0)), 1)

    return {
        'place': place,
        'score': match_percentage,
        'reasons': reasons[:3],
    }


def get_recommendations(preferences: dict, limit: int = 10) -> list:
    """
    Ranks database places against user preferences.
    Strictly filters by the user's selected destination (state or city).
    If no places exist for the requested destination, returns an empty list.
    """
    dest = preferences.get('destination', '').strip()
    qs = TouristPlace.objects.all()

    # Filter strictly by destination state/city if specified
    if dest:
        dest_qs = qs.filter(
            Q(state__icontains=dest) | Q(city__icontains=dest) | Q(name__icontains=dest)
        )
        if dest_qs.exists():
            qs = dest_qs
        else:
            # Destination has no database entries - return empty list
            return []

    scored_list = [score_place_for_user(p, preferences) for p in qs]

    # Sort descending by match score
    scored_list.sort(key=lambda x: x['score'], reverse=True)

    return scored_list[:limit]

