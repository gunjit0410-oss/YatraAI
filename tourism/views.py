import json
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import TouristPlace, SavedTrip, Favourite, UserFeedback
from .forms import PlanTripForm, CustomUserCreationForm
from .services.recommendation import get_recommendations
from .services.ai_service import generate_ai_itinerary
from .services.budget_service import calculate_trip_budget


def home_view(request):
    """Landing Page with Hero banner, top destinations, interests, and how it works."""
    featured_places = TouristPlace.objects.all().order_by('-rating')[:12]
    hidden_gems = TouristPlace.objects.filter(is_hidden_gem=True)[:4]
    
    categories = [
        {'name': 'Heritage', 'icon': 'fa-landmark', 'count': TouristPlace.objects.filter(category='Heritage').count()},
        {'name': 'Nature', 'icon': 'fa-tree', 'count': TouristPlace.objects.filter(category='Nature').count()},
        {'name': 'Adventure', 'icon': 'fa-mountain', 'count': TouristPlace.objects.filter(category='Adventure').count()},
        {'name': 'Culture', 'icon': 'fa-masks-theater', 'count': TouristPlace.objects.filter(category='Culture').count()},
        {'name': 'Spiritual', 'icon': 'fa-om', 'count': TouristPlace.objects.filter(category='Spiritual').count()},
        {'name': 'Beach', 'icon': 'fa-umbrella-beach', 'count': TouristPlace.objects.filter(category='Beach').count()},
        {'name': 'Hill Station', 'icon': 'fa-cloud-sun-rain', 'count': TouristPlace.objects.filter(category='Hill Station').count()},
        {'name': 'Food', 'icon': 'fa-utensils', 'count': TouristPlace.objects.filter(category='Food').count()},
    ]

    context = {
        'featured_places': featured_places,
        'hidden_gems': hidden_gems,
        'categories': categories,
    }
    return render(request, 'home.html', context)


CATEGORY_THEMES = {
    'heritage': {
        'name': 'Heritage',
        'icon': 'fa-landmark',
        'badge': 'Architectural Marvels & Historical Legends',
        'subtitle': 'Explore ancient forts, royal palaces, and UNESCO world heritage monuments across India.',
        'gradient': 'linear-gradient(135deg, #1e1b4b 0%, #431407 50%, #78350f 100%)',
        'accent_color': '#f59e0b',
        'text_badge_bg': 'rgba(245, 158, 11, 0.2)',
        'hero_img': '/static/images/places/kumbhalgarh.jpg',
    },
    'nature': {
        'name': 'Nature',
        'icon': 'fa-tree',
        'badge': 'Serene Wilderness & Natural Wonders',
        'subtitle': 'Immerse yourself in lush valleys, cascading waterfalls, crystal rivers, and pristine green landscapes.',
        'gradient': 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #14532d 100%)',
        'accent_color': '#10b981',
        'text_badge_bg': 'rgba(16, 185, 129, 0.2)',
        'hero_img': '/static/images/places/cherrapunji.jpg',
    },
    'wildlife': {
        'name': 'Wildlife',
        'icon': 'fa-paw',
        'badge': 'Wild Safaris & Forest Sanctuaries',
        'subtitle': 'Encounter royal Bengal tigers, Asiatic lions, and rare species in India\'s premier national parks.',
        'gradient': 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #1c1917 100%)',
        'accent_color': '#f97316',
        'text_badge_bg': 'rgba(249, 115, 22, 0.2)',
        'hero_img': '/static/images/places/kanha.jpg',
    },
    'spiritual': {
        'name': 'Spiritual',
        'icon': 'fa-om',
        'badge': 'Sacred Pilgrimages & Peaceful Ghats',
        'subtitle': 'Discover ancient holy temples, mystical riverside ghats, and timeless spiritual tranquility.',
        'gradient': 'linear-gradient(135deg, #311042 0%, #4c1d95 50%, #1e1b4b 100%)',
        'accent_color': '#a855f7',
        'text_badge_bg': 'rgba(168, 85, 247, 0.2)',
        'hero_img': '/static/images/places/kashi.jpg',
    },
    'adventure': {
        'name': 'Adventure',
        'icon': 'fa-mountain',
        'badge': 'Adrenaline & Extreme Explorations',
        'subtitle': 'Conquer dramatic granite canyons, high Himalayan passes, and thrilling offbeat trails.',
        'gradient': 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #1e293b 100%)',
        'accent_color': '#ef4444',
        'text_badge_bg': 'rgba(239, 68, 68, 0.2)',
        'hero_img': '/static/images/places/gandikota.jpg',
    },
    'hill-station': {
        'name': 'Hill Station',
        'icon': 'fa-cloud-sun-rain',
        'badge': 'Misty Peaks & Mountain Retreats',
        'subtitle': 'Escape to cool pine-scented hills, mist-shrouded valleys, and serene tea plantation slopes.',
        'gradient': 'linear-gradient(135deg, #0f172a 0%, #0e7490 50%, #164e63 100%)',
        'accent_color': '#06b6d4',
        'text_badge_bg': 'rgba(6, 182, 212, 0.2)',
        'hero_img': 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1200',
    },
    'culture': {
        'name': 'Culture',
        'icon': 'fa-masks-theater',
        'badge': 'Living Traditions & Folk Heritage',
        'subtitle': 'Experience vibrant living art forms, Portuguese heritage quarters, and sacred island traditions.',
        'gradient': 'linear-gradient(135deg, #4c0519 0%, #831843 50%, #2e1065 100%)',
        'accent_color': '#ec4899',
        'text_badge_bg': 'rgba(236, 72, 153, 0.2)',
        'hero_img': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200',
    },
    'beach': {
        'name': 'Beach',
        'icon': 'fa-umbrella-beach',
        'badge': 'Sun, Sand & Ocean Coastlines',
        'subtitle': 'Relax along golden sandy shores, coastal cliff views, and pristine oceanic horizons.',
        'gradient': 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #0369a1 100%)',
        'accent_color': '#38bdf8',
        'text_badge_bg': 'rgba(56, 189, 248, 0.2)',
        'hero_img': '/static/images/places/dhanushkodi.jpg',
    },
}


def category_detail_view(request, category_slug):
    """Unique custom-themed landing page for each travel category."""
    slug_lower = category_slug.lower().strip()
    theme = CATEGORY_THEMES.get(slug_lower)
    
    if not theme:
        cat_name = category_slug.replace('-', ' ').title()
        theme = {
            'name': cat_name,
            'icon': 'fa-compass',
            'badge': f'Explore {cat_name}',
            'subtitle': f'Discover top-rated destinations under {cat_name}.',
            'gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            'accent_color': '#f59e0b',
            'text_badge_bg': 'rgba(245, 158, 11, 0.2)',
            'hero_img': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200',
        }
    
    places = TouristPlace.objects.filter(category__iexact=theme['name']).order_by('-rating')
    hidden_gems = places.filter(is_hidden_gem=True)
    
    context = {
        'theme': theme,
        'places': places,
        'hidden_gems': hidden_gems,
        'total_count': places.count(),
    }
    return render(request, 'category_detail.html', context)



def explore_view(request):
    """Search and filter page for tourist places."""
    qs = TouristPlace.objects.all()

    query = request.GET.get('q', '').strip()
    category = request.GET.get('category', '').strip()
    state = request.GET.get('state', '').strip()
    max_cost = request.GET.get('max_cost', '').strip()
    hidden_only = request.GET.get('hidden_gem', '').strip()

    if query:
        qs = qs.filter(
            Q(name__icontains=query) |
            Q(city__icontains=query) |
            Q(state__icontains=query) |
            Q(description__icontains=query) |
            Q(tags__icontains=query)
        )

    if category:
        qs = qs.filter(category__iexact=category)

    if state:
        qs = qs.filter(state__icontains=state)

    if max_cost and max_cost.isdigit():
        qs = qs.filter(estimated_cost__lte=float(max_cost))

    if hidden_only == '1':
        qs = qs.filter(is_hidden_gem=True)

    states_list = TouristPlace.objects.values_list('state', flat=True).distinct().order_by('state')
    categories_list = TouristPlace.CATEGORY_CHOICES

    context = {
        'places': qs,
        'query': query,
        'selected_category': category,
        'selected_state': state,
        'max_cost': max_cost,
        'hidden_only': hidden_only,
        'states': states_list,
        'categories': categories_list,
    }
    return render(request, 'explore.html', context)


def place_detail_view(request, pk):
    """Detailed view for a single tourist place."""
    place = get_object_or_404(TouristPlace, pk=pk)
    is_favourite = False
    if request.user.is_authenticated:
        is_favourite = Favourite.objects.filter(user=request.user, place=place).exists()

    nearby_places = TouristPlace.objects.filter(state=place.state).exclude(pk=place.pk)[:3]

    context = {
        'place': place,
        'is_favourite': is_favourite,
        'nearby_places': nearby_places,
    }
    return render(request, 'place_detail.html', context)


def plan_trip_view(request):
    """Core Trip Planner preference form view."""
    if request.method == 'POST':
        form = PlanTripForm(request.POST)
        if form.is_valid():
            # Store in session for recommendations view
            request.session['trip_preferences'] = form.cleaned_data
            return redirect('recommendations')
    else:
        # Check if pre-filled state was passed in URL query
        initial_dest = request.GET.get('dest', 'Rajasthan')
        form = PlanTripForm(initial={'destination': initial_dest})

    return render(request, 'plan_trip.html', {'form': form})


def recommendations_view(request):
    """Displays ranked places from local recommendation engine."""
    preferences = request.session.get('trip_preferences')

    if not preferences:
        messages.info(request, "Please enter your travel preferences first.")
        return redirect('plan_trip')

    recommendations = get_recommendations(preferences, limit=12)

    context = {
        'preferences': preferences,
        'recommendations': recommendations,
    }
    return render(request, 'recommendations.html', context)


def itinerary_view(request):
    """Generates day-wise itinerary, budget analysis, and interactive map route."""
    if request.method == 'POST':
        place_ids = request.POST.getlist('selected_places')
        preferences = request.session.get('trip_preferences', {})

        if not place_ids:
            # Pick top 6 recommendations automatically if none checked
            recs = get_recommendations(preferences, limit=6)
            places = [r['place'] for r in recs]
        else:
            places = list(TouristPlace.objects.filter(id__in=place_ids))

        # Store selected place IDs in session
        request.session['selected_place_ids'] = [p.id for p in places]

    else:
        preferences = request.session.get('trip_preferences', {})
        place_ids = request.session.get('selected_place_ids', [])
        if not preferences:
            return redirect('plan_trip')

        if place_ids:
            places = list(TouristPlace.objects.filter(id__in=place_ids))
        else:
            recs = get_recommendations(preferences, limit=6)
            places = [r['place'] for r in recs]

    # 1. Generate AI Itinerary (or Fallback)
    itinerary_data = generate_ai_itinerary(preferences, places)

    # 2. Calculate Budget
    budget_info = calculate_trip_budget(preferences, places)

    # 3. Prepare Map Coordinates List
    map_places = []
    for p in places:
        map_places.append({
            'id': p.id,
            'name': p.name,
            'city': p.city,
            'lat': p.latitude,
            'lng': p.longitude,
            'category': p.category,
            'image': p.image_url,
            'cost': p.estimated_cost
        })

    # Save current itinerary context in session for saving
    request.session['current_itinerary'] = itinerary_data
    request.session['current_budget_info'] = budget_info

    context = {
        'preferences': preferences,
        'places': places,
        'itinerary': itinerary_data,
        'budget': budget_info,
        'map_places_json': json.dumps(map_places),
    }
    return render(request, 'itinerary.html', context)


@login_required
def save_trip_view(request):
    """Saves generated itinerary to user's account."""
    if request.method == 'POST':
        preferences = request.session.get('trip_preferences', {})
        place_ids = request.session.get('selected_place_ids', [])
        itinerary_data = request.session.get('current_itinerary', {})
        budget_info = request.session.get('current_budget_info', {})

        if not preferences:
            messages.error(request, "No active trip session found.")
            return redirect('plan_trip')

        dest = preferences.get('destination', 'India')
        days = preferences.get('num_days', 3)
        trip_name = f"{days}-Day {dest.title()} Explorer"

        trip = SavedTrip.objects.create(
            user=request.user,
            trip_name=trip_name,
            starting_location=preferences.get('starting_location', 'Origin'),
            destination=dest,
            num_days=days,
            budget=preferences.get('budget', 15000),
            travel_type=preferences.get('travel_type', 'Friends'),
            travel_pace=preferences.get('travel_pace', 'Balanced'),
            interests=", ".join(preferences.get('interests', [])),
            itinerary_json=itinerary_data,
            total_estimated_cost=budget_info.get('total_estimated', 0.0)
        )

        if place_ids:
            trip.selected_places.set(TouristPlace.objects.filter(id__in=place_ids))

        messages.success(request, f"Trip '{trip_name}' successfully saved to your profile!")
        return redirect('my_trips')

    return redirect('itinerary')


@login_required
def my_trips_view(request):
    """Displays saved trips for the authenticated user."""
    trips = SavedTrip.objects.filter(user=request.user)
    favourites = Favourite.objects.filter(user=request.user).select_related('place')

    context = {
        'trips': trips,
        'favourites': favourites,
    }
    return render(request, 'my_trips.html', context)


@login_required
def saved_trip_detail_view(request, pk):
    """Detail view for a previously saved trip."""
    trip = get_object_or_404(SavedTrip, pk=pk, user=request.user)
    places = trip.selected_places.all()

    map_places = []
    for p in places:
        map_places.append({
            'id': p.id,
            'name': p.name,
            'city': p.city,
            'lat': p.latitude,
            'lng': p.longitude,
            'category': p.category,
            'image': p.image_url,
            'cost': p.estimated_cost
        })

    context = {
        'trip': trip,
        'places': places,
        'itinerary': trip.itinerary_json,
        'map_places_json': json.dumps(map_places),
    }
    return render(request, 'saved_trip_detail.html', context)


@login_required
def delete_trip_view(request, pk):
    """Deletes a saved trip."""
    if request.method == 'POST':
        trip = get_object_or_404(SavedTrip, pk=pk, user=request.user)
        trip.delete()
        messages.success(request, "Trip removed successfully.")
    return redirect('my_trips')


def hidden_gems_view(request):
    """Dedicated page highlighting lesser-known eco-tourism hidden gems."""
    hidden_gems = TouristPlace.objects.filter(is_hidden_gem=True).order_by('-sustainability_score')
    return render(request, 'hidden_gems.html', {'hidden_gems': hidden_gems})


@login_required
def toggle_favourite_view(request, place_id):
    """AJAX / POST toggle for favouriting a tourist place."""
    place = get_object_or_404(TouristPlace, id=place_id)
    fav, created = Favourite.objects.get_or_create(user=request.user, place=place)
    
    if not created:
        fav.delete()
        is_fav = False
        msg = f"Removed {place.name} from Favourites."
    else:
        is_fav = True
        msg = f"Added {place.name} to Favourites!"

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({'status': 'ok', 'is_favourite': is_fav, 'message': msg})

    messages.info(request, msg)
    return redirect('place_detail', pk=place_id)


# Authentication Views
def register_view(request):
    """User registration view."""
    if request.user.is_authenticated:
        return redirect('my_trips')

    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Welcome to YatraAI, {user.username}!")
            return redirect('my_trips')
    else:
        form = CustomUserCreationForm()

    return render(request, 'register.html', {'form': form})


def login_view(request):
    """User login view."""
    if request.user.is_authenticated:
        return redirect('my_trips')

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f"Welcome back, {user.username}!")
            next_url = request.GET.get('next', 'my_trips')
            return redirect(next_url)
    else:
        form = AuthenticationForm()

    return render(request, 'login.html', {'form': form})


def logout_view(request):
    """User logout view."""
    logout(request)
    messages.info(request, "You have logged out successfully.")
    return redirect('home')


# REST API endpoints for DRF
@api_view(['GET'])
def api_destinations_list(request):
    """Returns distinct states and cities from the database for dynamic autocomplete."""
    states = list(TouristPlace.objects.values_list('state', flat=True).distinct().order_by('state'))
    cities = list(TouristPlace.objects.values_list('city', flat=True).distinct().order_by('city'))
    return Response({
        'states': states,
        'cities': cities
    })


@api_view(['GET'])
def api_places_list(request):
    """DRF Endpoint listing places as JSON."""
    places = TouristPlace.objects.all()[:50]
    data = []
    for p in places:
        data.append({
            'id': p.id,
            'name': p.name,
            'state': p.state,
            'city': p.city,
            'category': p.category,
            'estimated_cost': p.estimated_cost,
            'rating': p.rating,
            'is_hidden_gem': p.is_hidden_gem
        })
    return Response(data)


@api_view(['POST'])
def api_chat_view(request):
    """
    POST API Endpoint for Yatra AI Floating Chatbot.
    Receives user message and optional conversation history, returns AI response.
    """
    try:
        data = request.data if isinstance(request.data, dict) else json.loads(request.body.decode('utf-8'))
    except Exception:
        data = request.POST

    user_message = data.get('message', '').strip()
    history = data.get('history', [])

    if not user_message:
        return Response({'success': False, 'reply': 'Please type a message before sending.'}, status=400)

    from .services.chatbot_service import handle_chat_query
    res = handle_chat_query(
        user_message,
        history=history,
        user=request.user if request.user.is_authenticated else None
    )
    return Response(res)


@api_view(['POST'])
def api_feedback_view(request):
    """
    POST API Endpoint for explicitly submitting user complaints, feedback, or suggestions.
    """
    try:
        data = request.data if isinstance(request.data, dict) else json.loads(request.body.decode('utf-8'))
    except Exception:
        data = request.POST

    category = data.get('category', 'Feedback')
    message = data.get('message', '').strip()
    subject = data.get('subject', 'User Direct Submission')
    contact_email = data.get('email', '')

    if not message:
        return Response({'success': False, 'message': 'Message body cannot be empty.'}, status=400)

    fb = UserFeedback.objects.create(
        user=request.user if request.user.is_authenticated else None,
        category=category,
        subject=subject,
        message=message,
        contact_email=contact_email
    )
    return Response({'success': True, 'message': 'Thank you! Your feedback has been recorded successfully.', 'id': fb.id})


@api_view(['GET'])
def api_nearby_hotels_view(request):
    """
    GET API Endpoint to fetch nearby budget/economic hotel recommendations for a tourist spot.
    Query params: lat, lng, place_id, place_name, radius, sort
    """
    lat = request.GET.get('lat')
    lng = request.GET.get('lng')
    place_name = request.GET.get('place_name', 'Spot')
    
    try:
        radius = float(request.GET.get('radius', 5.0))
    except (ValueError, TypeError):
        radius = 5.0

    sort_by = request.GET.get('sort', 'distance')

    if (not lat or not lng) and request.GET.get('place_id'):
        try:
            place = TouristPlace.objects.get(pk=request.GET.get('place_id'))
            lat = place.latitude
            lng = place.longitude
            if not place_name or place_name == 'Spot':
                place_name = place.name
        except TouristPlace.DoesNotExist:
            pass

    from .services.hotel_service import get_nearby_hotels
    hotels = get_nearby_hotels(lat=lat, lng=lng, place_name=place_name, radius_km=radius, sort_by=sort_by)

    return Response({
        'success': True,
        'place_name': place_name,
        'lat': lat,
        'lng': lng,
        'total_found': len(hotels),
        'hotels': hotels
    })



