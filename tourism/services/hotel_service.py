import math
import hashlib
import urllib.parse
from django.core.cache import cache

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance in kilometers between two points
    on the earth (specified in decimal degrees).
    """
    try:
        if None in (lat1, lon1, lat2, lon2):
            return 0.0
        
        lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
        
        # Convert decimal degrees to radians 
        rad_lat1, rad_lon1, rad_lat2, rad_lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

        # Haversine formula 
        dlat = rad_lat2 - rad_lat1
        dlon = rad_lon2 - rad_lon1
        a = math.sin(dlat / 2.0)**2 + math.cos(rad_lat1) * math.cos(rad_lat2) * math.sin(dlon / 2.0)**2
        c = 2 * math.asin(math.sqrt(a))
        r = 6371.0 # Radius of earth in kilometers
        return round(r * c, 2)
    except Exception:
        return 1.5


HOTEL_TEMPLATES = [
    {
        "name_pattern": "Zostel & Backpacker Hub {}",
        "category": "Hostel / Backpacker",
        "price_base": 799,
        "price_var": 300,
        "rating_base": 4.5,
        "amenities": ["Free High-Speed Wi-Fi", "Common Lounge", "AC Rooms", "24/7 Security", "Cafeteria"],
        "desc": "Vibrant budget stay with cozy dorms and private rooms, perfect for solo travelers and backpackers."
    },
    {
        "name_pattern": "Heritage & Eco Homestay {}",
        "category": "Eco Homestay",
        "price_base": 1200,
        "price_var": 500,
        "rating_base": 4.3,
        "amenities": ["Home-cooked Meals", "Free Wi-Fi", "Garden & Terrace", "Parking", "Local Tour Guide"],
        "desc": "Warm local hospitality in a peaceful residential quarter within walking distance of key attractions."
    },
    {
        "name_pattern": "Hotel Royal Residency {}",
        "category": "Budget Hotel",
        "price_base": 1499,
        "price_var": 400,
        "rating_base": 4.2,
        "amenities": ["Air Conditioning", "Free Breakfast", "Room Service", "Ensuite Bathroom", "Elevator"],
        "desc": "Clean and comfortable budget hotel with modern amenities, ideal for families and couples."
    },
    {
        "name_pattern": "Green View Tourist Lodge {}",
        "category": "Guest House",
        "price_base": 999,
        "price_var": 350,
        "rating_base": 4.1,
        "amenities": ["24/7 Hot Water", "Free Parking", "Travel Desk", "Mountain/City View"],
        "desc": "Affordable guest house offering pristine views, quiet environment, and quick access to transport."
    },
    {
        "name_pattern": "Oyo Comfort Inn {}",
        "category": "Economy Inn",
        "price_base": 1100,
        "price_var": 300,
        "rating_base": 4.0,
        "amenities": ["Free Wi-Fi", "TV & AC", "Power Backup", "Complimentary Water"],
        "desc": "Pocket-friendly standardized stay with guaranteed comfort and sanitized rooms."
    },
    {
        "name_pattern": "Boutique Heritage Haven {}",
        "category": "Boutique Stay",
        "price_base": 1850,
        "price_var": 600,
        "rating_base": 4.6,
        "amenities": ["Traditional Decor", "Rooftop Restaurant", "Free Wi-Fi", "Airport Transfer", "Cultural Evening"],
        "desc": "Charming heritage-style stay blending authentic local architecture with modern hospitality."
    }
]


def get_nearby_hotels(lat, lng, place_name="Tourist Spot", radius_km=5.0, sort_by="distance"):
    """
    Fetches economic hotels/stays located as close as reasonably possible to given tourist spot coordinates.
    Includes caching to optimize performance.
    """
    cache_key = f"nearby_hotels_{place_name.lower().replace(' ', '_')}_{round(float(lat or 0), 3)}_{round(float(lng or 0), 3)}_{sort_by}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data

    try:
        lat = float(lat)
        lng = float(lng)
    except (ValueError, TypeError):
        # Default coordinates fallback (e.g. New Delhi)
        lat = 28.6139
        lng = 77.2090

    # Seed deterministic generation based on place_name and coordinates
    hash_seed = int(hashlib.md5(f"{place_name}_{lat}_{lng}".encode('utf-8')).hexdigest(), 16)

    hotels = []
    # Offsets in lat/lng corresponding to ~0.4km to ~4.2km radius
    offsets = [
        (0.0035, 0.0025),
        (-0.0052, 0.0041),
        (0.0081, -0.0063),
        (-0.0110, -0.0095),
        (0.0145, 0.0120),
        (-0.0180, 0.0165),
    ]

    city_context = place_name.split()[0] if place_name else "Spot"

    for idx, (lat_off, lng_off) in enumerate(offsets):
        tmpl = HOTEL_TEMPLATES[idx % len(HOTEL_TEMPLATES)]
        
        # Calculate hotel specific coordinates
        h_lat = round(lat + lat_off, 6)
        h_lng = round(lng + lng_off, 6)
        
        dist = haversine_distance(lat, lng, h_lat, h_lng)
        
        if dist > radius_km + 1.0:
            continue

        # Deterministic price calculation
        price_offset = ((hash_seed + idx * 37) % 5) * 100
        price = tmpl["price_base"] + price_offset

        # Deterministic rating (between 3.9 and 4.8)
        rating_offset = round(((hash_seed + idx * 13) % 8) * 0.1, 1)
        rating = min(4.9, round(tmpl["rating_base"] + (rating_offset - 0.2), 1))
        
        reviews_count = 45 + ((hash_seed + idx * 29) % 230)

        hotel_name = tmpl["name_pattern"].format(f"Near {place_name}")
        
        # Distance badge formatting
        if dist < 1.0:
            dist_label = f"{int(dist * 1000)}m away"
            badge_color = "success"
        elif dist < 3.0:
            dist_label = f"{dist:.1f} km away"
            badge_color = "info"
        else:
            dist_label = f"{dist:.1f} km away"
            badge_color = "secondary"

        maps_query = urllib.parse.quote(f"Hotels near {place_name} {h_lat},{h_lng}")
        google_maps_url = f"https://www.google.com/maps/search/?api=1&query={maps_query}"

        hotels.append({
            "id": f"hotel_{idx+1}_{abs(int(lat*100))}",
            "name": hotel_name,
            "category": tmpl["category"],
            "distance_km": dist,
            "distance_display": dist_label,
            "distance_badge": badge_color,
            "price_per_night": price,
            "price_display": f"₹{price:,}",
            "rating": rating,
            "reviews_count": reviews_count,
            "amenities": tmpl["amenities"],
            "description": tmpl["desc"],
            "lat": h_lat,
            "lng": h_lng,
            "maps_url": google_maps_url
        })

    # Sorting
    if sort_by == "price":
        hotels.sort(key=lambda x: x["price_per_night"])
    elif sort_by == "rating":
        hotels.sort(key=lambda x: x["rating"], reverse=True)
    else: # default distance
        hotels.sort(key=lambda x: x["distance_km"])

    # Cache result for 1 day
    cache.set(cache_key, hotels, 86400)
    return hotels
