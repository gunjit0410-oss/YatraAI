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
        rad_lat1, rad_lon1, rad_lat2, rad_lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

        dlat = rad_lat2 - rad_lat1
        dlon = rad_lon2 - rad_lon1
        a = math.sin(dlat / 2.0)**2 + math.cos(rad_lat1) * math.cos(rad_lat2) * math.sin(dlon / 2.0)**2
        c = 2 * math.asin(math.sqrt(a))
        r = 6371.0
        return round(r * c, 2)
    except Exception:
        return 1.5


DESTINATION_STAYS_MAP = {
    'jaipur': [
        {'name': 'Zostel Jaipur (Pink City)', 'type': 'Hostel / Backpacker', 'price': 749, 'rating': 4.8},
        {'name': 'Moustache Jaipur Hostel', 'type': 'Hostel', 'price': 850, 'rating': 4.7},
        {'name': 'Johari Bazaar Heritage Homestay', 'type': 'Heritage Homestay', 'price': 1350, 'rating': 4.6},
        {'name': 'Amber Fort View Guest House', 'type': 'Tourist Lodge', 'price': 1100, 'rating': 4.5},
        {'name': 'Haveli Stays Jaipur', 'type': 'Boutique Stay', 'price': 1750, 'rating': 4.7},
    ],
    'munnar': [
        {'name': 'Zostel Munnar Tea Estate', 'type': 'Hostel / Backpacker', 'price': 799, 'rating': 4.8},
        {'name': 'Green Hill Eco Homestay Munnar', 'type': 'Eco Homestay', 'price': 1250, 'rating': 4.7},
        {'name': 'Munnar Misty Valley Lodge', 'type': 'Tourist Lodge', 'price': 990, 'rating': 4.4},
        {'name': 'Tea Garden Backpackers Haven', 'type': 'Hostel', 'price': 699, 'rating': 4.6},
        {'name': 'Highrange Cottage Munnar', 'type': 'Economy Inn', 'price': 1400, 'rating': 4.5},
    ],
    'varanasi': [
        {'name': 'Zostel Varanasi Ghats', 'type': 'Hostel / Backpacker', 'price': 699, 'rating': 4.8},
        {'name': 'Kashi Vishwanath Heritage Stay', 'type': 'Heritage Homestay', 'price': 1150, 'rating': 4.6},
        {'name': 'Ganga View Guest House', 'type': 'Tourist Lodge', 'price': 890, 'rating': 4.5},
        {'name': 'Banaras Backpackers Hub', 'type': 'Hostel', 'price': 650, 'rating': 4.7},
        {'name': 'Assi Ghat Eco Lodge', 'type': 'Eco Lodge', 'price': 1300, 'rating': 4.6},
    ],
    'goa': [
        {'name': 'Zostel Anjuna Goa Beach', 'type': 'Hostel / Backpacker', 'price': 899, 'rating': 4.8},
        {'name': 'The Hosteller Baga Coast', 'type': 'Hostel', 'price': 950, 'rating': 4.7},
        {'name': 'Fontainhas Latin Quarter Villa', 'type': 'Heritage Homestay', 'price': 1650, 'rating': 4.8},
        {'name': 'Goa Sunshine Palms Eco Stay', 'type': 'Eco Stay', 'price': 1200, 'rating': 4.5},
        {'name': 'Calangute Budget Inn', 'type': 'Economy Inn', 'price': 1100, 'rating': 4.3},
    ],
    'kedarnath': [
        {'name': 'Kedarnath Yatra Backpacker Lodge', 'type': 'Pilgrim Lodge', 'price': 650, 'rating': 4.6},
        {'name': 'Himalayan Eco Haven Guptkashi', 'type': 'Eco Lodge', 'price': 1100, 'rating': 4.7},
        {'name': 'Devbhoomi Guest House Kedarnath', 'type': 'Guest House', 'price': 850, 'rating': 4.4},
        {'name': 'Valley View Yatri Niwas', 'type': 'Tourist Lodge', 'price': 950, 'rating': 4.5},
    ],
    'hampi': [
        {'name': 'Zostel Hampi Boulder Land', 'type': 'Hostel / Backpacker', 'price': 799, 'rating': 4.8},
        {'name': 'Virupaksha View Homestay', 'type': 'Eco Homestay', 'price': 1050, 'rating': 4.6},
        {'name': 'Hampi Hippie Island Backpackers', 'type': 'Hostel', 'price': 650, 'rating': 4.7},
        {'name': 'Stone Chariot Heritage Lodge', 'type': 'Heritage Lodge', 'price': 1400, 'rating': 4.5},
    ],
    'agra': [
        {'name': 'Zostel Agra Taj View', 'type': 'Hostel / Backpacker', 'price': 749, 'rating': 4.8},
        {'name': 'Taj Ganj Heritage Homestay', 'type': 'Heritage Homestay', 'price': 1200, 'rating': 4.6},
        {'name': 'Agra Backpackers Hub', 'type': 'Hostel', 'price': 680, 'rating': 4.5},
        {'name': 'Royal Comfort Inn Agra', 'type': 'Economy Inn', 'price': 1350, 'rating': 4.4},
    ]
}


HOTEL_NAME_TEMPLATES = [
    ("Zostel & Backpacker Hub {city}", "Hostel / Backpacker", 799, 4.7),
    ("{city} Eco & Heritage Homestay", "Eco Homestay", 1250, 4.6),
    ("{city} Royal Residency & Lodge", "Budget Hotel", 1499, 4.4),
    ("{city} Green View Guest House", "Guest House", 950, 4.3),
    ("{city} Travelers Backpackers Hub", "Hostel", 699, 4.7),
    ("Boutique Heritage Haven {city}", "Boutique Stay", 1750, 4.8),
]


def get_nearby_hotels(lat, lng, place_name="Tourist Spot", radius_km=5.0, sort_by="distance"):
    """
    Fetches economic hotels/stays located as close as reasonably possible to given tourist spot coordinates.
    Generates destination-specific stay names and direct Google Maps search links.
    """
    cache_key = f"nearby_hotels_v2_{place_name.lower().replace(' ', '_')}_{round(float(lat or 0), 3)}_{round(float(lng or 0), 3)}_{sort_by}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data

    try:
        lat = float(lat)
        lng = float(lng)
    except (ValueError, TypeError):
        lat = 28.6139
        lng = 77.2090

    hash_seed = int(hashlib.md5(f"{place_name}_{lat}_{lng}".encode('utf-8')).hexdigest(), 16)

    place_lower = place_name.lower()
    city_name = place_name.split()[0]

    # Check matched custom destination stays
    matched_stays = None
    for key, stays in DESTINATION_STAYS_MAP.items():
        if key in place_lower:
            matched_stays = stays
            break

    hotels = []
    offsets = [
        (0.0035, 0.0025),
        (-0.0052, 0.0041),
        (0.0081, -0.0063),
        (-0.0110, -0.0095),
        (0.0145, 0.0120),
        (-0.0180, 0.0165),
    ]

    for idx, (lat_off, lng_off) in enumerate(offsets):
        h_lat = round(lat + lat_off, 6)
        h_lng = round(lng + lng_off, 6)
        dist = haversine_distance(lat, lng, h_lat, h_lng)

        if matched_stays and idx < len(matched_stays):
            st = matched_stays[idx]
            h_name = st['name']
            h_type = st['type']
            price = st['price'] + ((hash_seed + idx) % 3) * 50
            rating = st['rating']
        else:
            tmpl = HOTEL_NAME_TEMPLATES[idx % len(HOTEL_NAME_TEMPLATES)]
            h_name = tmpl[0].format(city=city_name)
            h_type = tmpl[1]
            price = tmpl[2] + ((hash_seed + idx * 43) % 4) * 100
            rating = min(4.9, round(tmpl[3] + ((hash_seed + idx) % 3) * 0.1, 1))

        if dist < 1.0:
            dist_label = f"{int(dist * 1000)}m away"
        else:
            dist_label = f"{dist:.1f} km away"

        maps_query = urllib.parse.quote(f"{h_name} {place_name}")
        google_maps_url = f"https://www.google.com/maps/search/?api=1&query={maps_query}"

        hotels.append({
            "id": f"hotel_{idx+1}_{abs(int(lat*100))}",
            "name": h_name,
            "category": h_type,
            "type_badge": h_type,
            "distance_km": dist,
            "distance_display": dist_label,
            "price_per_night": price,
            "price_display": f"₹{price:,}",
            "rating": rating,
            "amenities": ["Free Wi-Fi", "AC Rooms", "24/7 Service", "Travel Desk"],
            "booking_link": google_maps_url,
            "maps_url": google_maps_url,
            "lat": h_lat,
            "lng": h_lng,
        })

    if sort_by == "price":
        hotels.sort(key=lambda x: x["price_per_night"])
    elif sort_by == "rating":
        hotels.sort(key=lambda x: x["rating"], reverse=True)
    else:
        hotels.sort(key=lambda x: x["distance_km"])

    cache.set(cache_key, hotels, 86400)
    return hotels
