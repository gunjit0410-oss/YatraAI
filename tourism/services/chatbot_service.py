import json
import os
import logging
from django.conf import settings
from django.db.models import Q
from tourism.models import TouristPlace, UserFeedback

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are Yatra AI Assistant, an intelligent, friendly, and expert tourism & customer-support virtual assistant for the Yatra AI platform.

Your primary mission is to help users:
1. Explore top destinations across India and discover tailored travel ideas.
2. Guide users on how to use Yatra AI features (Plan My Trip, Search & Filters, Hidden Gems, Saved Trips, Maps).
3. Answer general travel, itinerary, budget, hotel, and local culture questions.
4. Listen to user complaints, troubleshoot website issues, and guide users on reporting problems.
5. Collect user feedback, suggestions, and new destination ideas.

YATRA AI PLATFORM MAP & NAVIGATION:
- Home Page (`/`): Landing page featuring category tickers, featured attractions, and step-by-step guidance.
- Plan My Trip (`/plan/`): Interactive AI trip planning wizard where users set destination, budget (INR), days, travel type, pace, and interests.
- Explore (`/explore/`): Full destination catalog with search bar and state/category/budget filters.
- Hidden Gems (`/hidden-gems/`): Offbeat, sustainable destinations with eco-scores across India.
- Category Pages (`/category/<category_slug>/`): Dedicated pages for Heritage, Nature, Wildlife, Spiritual, Adventure, Hill Station, Culture, and Beach.
- My Trips (`/my-trips/`): Personal dashboard showing user's saved itineraries and day-by-day plans.
- Account Access (`/login/`, `/register/`): Secure user registration and authentication.

BEHAVIOR RULES & TONE:
- Be warm, helpful, concise, and professional.
- Format responses cleanly using short paragraphs, bullet points, and markdown links where helpful (e.g., [Plan My Trip](/plan/), [Explore Destinations](/explore/)).
- Context Awareness: Maintain ongoing conversation context when answering follow-up questions.
- Accuracy: Do not invent false information. If you are uncertain, state clearly that you don't know or suggest official travel resources.
- Real-time Data Disclaimer: For live train/flight timings, current weather forecasts, or live ticket prices, politely advise users to check official booking channels.
- Complaints & Support: If a user reports a website issue (e.g. "map not loading", "cannot save trip"), express empathy, gather key details (page name, action attempted), and assure them that their feedback is recorded.
- Feedback & Suggestions: Welcome suggestions for platform improvements or new place additions warmly.
- Privacy: Do not request sensitive personal info (passwords, payment card numbers).
"""


def search_places_context(query: str) -> str:
    """Searches the TouristPlace database for relevant destinations matching user query terms."""
    query_clean = query.strip()
    if not query_clean or len(query_clean) < 2:
        return ""

    # Check for category matches or location matches
    places = TouristPlace.objects.filter(
        Q(name__icontains=query_clean) |
        Q(city__icontains=query_clean) |
        Q(state__icontains=query_clean) |
        Q(category__icontains=query_clean) |
        Q(tags__icontains=query_clean)
    ).order_by('-rating')[:5]

    if not places.exists():
        return ""

    context_items = []
    for p in places:
        context_items.append(
            f"- {p.name} ({p.city}, {p.state}): Category: {p.category}, Rating: {p.rating}/5, "
            f"Est. Cost: ₹{p.estimated_cost}/day, Best Time: {p.best_time}. {p.short_description}"
        )
    return "\nVERIFIED DATABASE DESTINATIONS MATCHING QUERY:\n" + "\n".join(context_items)


def generate_fallback_bot_response(user_message: str, user=None) -> str:
    """
    Intelligent rule-based local assistant fallback when Gemini API key is missing or offline.
    Ensures 100% reliable functionality at all times.
    """
    msg_lower = user_message.lower()

    # 1. Complaint & Technical Support
    if any(k in msg_lower for k in ['bug', 'issue', 'problem', 'error', 'not working', 'cant open', 'cannot open', 'broken', 'complaint', 'fault', 'failed']):
        # Automatically record a complaint feedback entry
        UserFeedback.objects.create(
            user=user if (user and user.is_authenticated) else None,
            category='Complaint',
            subject='Chatbot User Issue Report',
            message=user_message,
            status='Pending'
        )
        return (
            "I'm sorry to hear you're experiencing an issue with Yatra AI! "
            "I have logged your report directly into our support database. "
            "Could you please share a few more details?\n"
            "- Which page or feature were you using?\n"
            "- What error or behavior occurred?\n"
            "Our technical team will investigate and fix it right away!"
        )

    # 2. Feedback & Suggestions
    if any(k in msg_lower for k in ['feedback', 'suggestion', 'suggest place', 'improve', 'idea', 'feature request']):
        UserFeedback.objects.create(
            user=user if (user and user.is_authenticated) else None,
            category='Feedback',
            subject='Chatbot User Feedback',
            message=user_message,
            status='Received'
        )
        return (
            "Thank you so much for your valuable feedback! We love hearing from our travelers. "
            "I have recorded your suggestion directly into our feedback system. "
            "If you have more ideas or new destination requests, feel free to share!"
        )

    # 3. Navigation & Website Feature Help
    if any(k in msg_lower for k in ['how to plan', 'plan trip', 'create trip', 'itinerary', 'wizard']):
        return (
            "You can easily plan a customized trip using our **AI Trip Planner**! "
            "Simply click on [Plan My Trip](/plan/), choose your destination, budget, number of days, "
            "and travel interests. Our system will generate a day-wise itinerary, budget breakdown, and map for you!"
        )

    if any(k in msg_lower for k in ['hidden gem', 'offbeat', 'sustainable', 'eco']):
        return (
            "We have a special curated collection of eco-friendly, offbeat locations! "
            "Check out our [Hidden Gems](/hidden-gems/) section to discover pristine untouched places in India."
        )

    if any(k in msg_lower for k in ['my trip', 'saved trip', 'bookmark', 'account']):
        return (
            "You can view and manage all your saved travel plans anytime on your "
            "[My Trips Dashboard](/my-trips/). Make sure you are logged in to save your itineraries!"
        )

    if any(k in msg_lower for k in ['explore', 'search', 'destinations', 'filter', 'places']):
        return (
            "Looking for places to visit? You can search and filter over 68 curated destinations on our "
            "[Explore Page](/explore/) by state, category, maximum budget, or keyword search!"
        )


    # 4. Destination search fallback
    db_context = search_places_context(user_message)
    if db_context:
        lines = db_context.strip().split('\n')[1:] # Skip header
        reply = "Here are top destinations matching your query from our Yatra AI database:\n\n"
        for line in lines[:3]:
            reply += line + "\n"
        reply += "\nYou can explore full details and map directions on our [Explore Page](/explore/)!"
        return reply

    # 5. General Greeting or Fallback
    if any(k in msg_lower for k in ['hi', 'hello', 'hey', 'namaste', 'greetings']):
        return "Hello! Namaste! 🙏 I'm your **Yatra AI Travel Assistant**. How can I help you plan your journey across Incredible India today?"

    return (
        "I'm here to help you with destination recommendations, trip planning, website features, or technical support! "
        "You can ask me questions like:\n"
        "- *'Suggest a 3-day heritage trip in Rajasthan'*\n"
        "- *'How do I plan a trip on Yatra AI?'*\n"
        "- *'Show me offbeat places in Kerala'*\n"
        "- *'I want to give feedback or report a problem'*"
    )


def handle_chat_query(user_message: str, history: list = None, user=None) -> dict:
    """
    Main handler for processing user chatbot queries.
    Sends user prompt directly to Google Gemini API when GEMINI_API_KEY is configured.
    """
    if not user_message or not user_message.strip():
        return {"success": False, "reply": "Please enter a valid message."}

    user_message_clean = user_message.strip()[:1500] # Limit input length to 1500 chars

    # Retrieve API key & configured model name
    api_key = getattr(settings, 'GEMINI_API_KEY', '') or getattr(settings, 'AI_API_KEY', '') or os.getenv('GEMINI_API_KEY', '') or os.getenv('AI_API_KEY', '')
    model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-3.6-flash') or os.getenv('GEMINI_MODEL', 'gemini-3.6-flash')

    if not api_key or api_key == 'your_gemini_api_key_here':
        logger.info("GEMINI_API_KEY missing. Using fallback travel assistant engine.")
        reply = generate_fallback_bot_response(user_message_clean, user=user)
        return {"success": True, "reply": reply, "source": "Rule Engine Fallback", "model": "Offline"}

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        # Context enrichment from database if user mentions destinations
        db_extra_context = search_places_context(user_message_clean)

        # Build full system instruction for Gemini
        system_instruction_full = SYSTEM_PROMPT
        if db_extra_context:
            system_instruction_full += f"\n{db_extra_context}\n"

        # Build conversation history transcript
        history_formatted = []
        if history and isinstance(history, list):
            for item in history[-6:]: # Keep last 6 exchanges for context
                role = item.get('role', 'user')
                content = item.get('content', '')
                if content:
                    history_formatted.append(f"{'User' if role=='user' else 'Assistant'}: {content}")

        history_str = "\n".join(history_formatted) if history_formatted else "No previous conversation history."

        prompt = f"RECENT CONVERSATION HISTORY:\n{history_str}\n\nCURRENT USER QUERY:\nUser: {user_message_clean}\nAssistant:"

        # Call Gemini API with configured model
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction_full,
                temperature=0.4,
                max_output_tokens=800
            )
        )

        reply_text = response.text.strip() if (response and hasattr(response, 'text') and response.text) else ""

        if not reply_text:
            reply_text = generate_fallback_bot_response(user_message_clean, user=user)

        # Silently record complaint/feedback in DB if detected
        msg_lower = user_message_clean.lower()
        if any(k in msg_lower for k in ['complaint', 'not working', 'bug', 'error', 'broken', 'issue']):
            UserFeedback.objects.create(
                user=user if (user and user.is_authenticated) else None,
                category='Complaint',
                subject='Chatbot Auto-Logged Issue',
                message=user_message_clean,
                status='Pending'
            )
        elif any(k in msg_lower for k in ['feedback', 'suggestion', 'idea']):
            UserFeedback.objects.create(
                user=user if (user and user.is_authenticated) else None,
                category='Feedback',
                subject='Chatbot Auto-Logged Feedback',
                message=user_message_clean,
                status='Received'
            )

        return {"success": True, "reply": reply_text, "source": "Google Gemini API", "model": model_name}

    except Exception as e:
        logger.error(f"Error executing Gemini API chat with model {model_name}: {str(e)}")
        # Try fallback model if 404 or model unavailable
        if "404" in str(e) or "NOT_FOUND" in str(e):
            try:
                logger.info("Attempting backup model gemini-1.5-flash...")
                response = client.models.generate_content(
                    model='gemini-1.5-flash',
                    contents=user_message_clean,
                    config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT, max_output_tokens=800)
                )
                if response and hasattr(response, 'text') and response.text:
                    return {"success": True, "reply": response.text.strip(), "source": "Google Gemini API (Backup Model)", "model": "gemini-1.5-flash"}
            except Exception as ex2:
                logger.error(f"Backup Gemini API call failed: {str(ex2)}")

        fallback_reply = generate_fallback_bot_response(user_message_clean, user=user)
        return {"success": True, "reply": fallback_reply, "source": "Fallback Engine"}

