import json
import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def generate_fallback_itinerary(preferences: dict, recommended_places: list) -> dict:
    """
    Generates a realistic, deterministic day-wise itinerary when AI API key is missing or fails.
    This guarantees 100% working SIH live demonstration!
    """
    num_days = max(1, int(preferences.get('num_days', 3)))
    dest = preferences.get('destination', 'India').title()
    pace = preferences.get('travel_pace', 'Balanced')
    interests = ", ".join(preferences.get('interests', ['Heritage', 'Nature']))

    days_list = []
    num_places = len(recommended_places)

    if num_places == 0:
        return {
            "days": [],
            "summary": f"No destinations are currently available for this location ({dest}). Try another destination.",
            "no_places": True,
            "source": "System Notification"
        }

    place_index = 0


    for day in range(1, num_days + 1):
        # Pick 2-3 places per day from recommendations list (wrapping around if needed)
        morning_place = recommended_places[place_index % num_places]
        place_index += 1

        afternoon_place = recommended_places[place_index % num_places]
        place_index += 1

        evening_place = recommended_places[place_index % num_places]
        place_index += 1

        day_titles = [
            f"Day {day}: Cultural Overview & Architectural Wonders",
            f"Day {day}: Scenic Nature & Local Traditions",
            f"Day {day}: Heritage Walking Trails & Culinary Discoveries",
            f"Day {day}: Leisure, Shopping & Sunset Viewpoints",
            f"Day {day}: Hidden Gems & Local Experiences"
        ]

        title = day_titles[(day - 1) % len(day_titles)]

        days_list.append({
            "day_number": day,
            "title": title,
            "morning": {
                "place_name": morning_place.name,
                "place_id": getattr(morning_place, 'id', None),
                "city": morning_place.city,
                "lat": morning_place.latitude,
                "lng": morning_place.longitude,
                "activity": f"Morning guided walkthrough of {morning_place.name}. Enjoy photo spots and architectural heritage.",
                "duration": f"{morning_place.recommended_duration} Hours",
                "estimated_cost": morning_place.estimated_cost,
                "tip": f"Best visited during early morning hours ({morning_place.best_time})."
            },
            "afternoon": {
                "place_name": afternoon_place.name,
                "place_id": getattr(afternoon_place, 'id', None),
                "city": afternoon_place.city,
                "lat": afternoon_place.latitude,
                "lng": afternoon_place.longitude,
                "activity": f"Afternoon visit to {afternoon_place.name} followed by authentic local lunch nearby.",
                "duration": f"{afternoon_place.recommended_duration} Hours",
                "estimated_cost": afternoon_place.estimated_cost,
                "tip": f"Sample authentic regional cuisine at local food stalls near {afternoon_place.city} market."
            },
            "evening": {
                "place_name": evening_place.name,
                "place_id": getattr(evening_place, 'id', None),
                "city": evening_place.city,
                "lat": evening_place.latitude,
                "lng": evening_place.longitude,
                "activity": f"Evening relaxation and sunset view at {evening_place.name} with local handicraft shopping.",
                "duration": "2.5 Hours",
                "estimated_cost": round(evening_place.estimated_cost * 0.5, 2),
                "tip": "Capture beautiful golden hour sunset views."
            }
        })

    return {
        "days": days_list,
        "summary": f"Curated {num_days}-day itinerary for {dest} tailored for {preferences.get('travel_type', 'Friends')} traveling with a {pace.lower()} pace focusing on {interests}.",
        "source": "Smart Rule Engine (Offline Fallback)"
    }


def generate_ai_itinerary(preferences: dict, recommended_places: list) -> dict:
    """
    Generates a personalized day-wise itinerary using Gemini LLM API if key is present,
    else seamlessly defaults to local deterministic fallback generator.
    """
    if not recommended_places:
        return {
            "days": [],
            "summary": f"No destinations are currently available for this location. Try another destination.",
            "no_places": True,
            "source": "System Notification"
        }

    api_key = getattr(settings, 'AI_API_KEY', '') or os.getenv('AI_API_KEY', '')

    if not api_key or api_key == 'your_gemini_api_key_here':
        logger.info("AI API key missing or default. Utilizing local fallback itinerary engine.")
        return generate_fallback_itinerary(preferences, recommended_places)


    try:
        # Import Google GenAI SDK
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        places_info = []
        for p in recommended_places[:8]:
            places_info.append({
                "id": getattr(p, 'id', None),
                "name": p.name,
                "city": p.city,
                "state": p.state,
                "category": p.category,
                "cost": p.estimated_cost,
                "duration_hours": p.recommended_duration,
                "lat": p.latitude,
                "lng": p.longitude,
                "description": p.short_description
            })

        prompt = f"""
You are YatraAI, an expert travel planner for Indian Tourism.
Generate a realistic {preferences.get('num_days', 3)}-day itinerary for a travel group of '{preferences.get('travel_type', 'Friends')}' visiting '{preferences.get('destination', 'India')}' with total budget of ₹{preferences.get('budget', 15000)}.
Interests: {', '.join(preferences.get('interests', []))}.
Pace: {preferences.get('travel_pace', 'Balanced')}.

Use ONLY these verified database places as your primary destinations:
{json.dumps(places_info, indent=2)}

Output strictly valid JSON with NO markdown code blocks or additional text around it. Follow this schema:
{{
  "days": [
    {{
      "day_number": 1,
      "title": "Day Title",
      "morning": {{
        "place_name": "Exact Name",
        "place_id": 1,
        "city": "City Name",
        "lat": 26.9,
        "lng": 75.8,
        "activity": "Detailed activity description",
        "duration": "3 Hours",
        "estimated_cost": 500,
        "tip": "Useful travel tip"
      }},
      "afternoon": {{ ... }},
      "evening": {{ ... }}
    }}
  ],
  "summary": "Concise overview of the personalized journey"
}}
"""

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.3
            )
        )

        raw_text = response.text.strip()
        # Clean any accidental markdown quotes
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]

        parsed = json.loads(raw_text.strip())
        parsed['source'] = 'Gemini AI'
        return parsed

    except Exception as e:
        logger.error(f"Error calling Gemini AI API: {str(e)}. Falling back to offline engine.")
        return generate_fallback_itinerary(preferences, recommended_places)
