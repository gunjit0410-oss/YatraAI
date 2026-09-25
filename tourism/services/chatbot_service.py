import json
import os
import logging
from django.conf import settings
from django.db.models import Q
from tourism.models import TouristPlace, UserFeedback

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are Yatra AI Assistant, an intelligent, friendly, and expert tourism virtual assistant for the Yatra AI travel platform.

YOUR PRIMARY MISSION:
1. Recommend top destinations across India tailored to user preferences.
2. Provide day-wise itinerary suggestions, budget estimates, best times to visit, and local culture tips.
3. Guide users on website navigation ([Plan My Trip](/plan/), [Explore Catalog](/explore/), [My Trips](/my-trips/)).

CRITICAL RESPONSE FORMATTING RULES (MUST FOLLOW):
- Always structure your responses with clean sections, bold headers, and emojis for high legibility.
- Use bullet points for destination lists:
  • **Place Name** (City, State) — *Category* | ⭐ Rating | 💰 Est. Cost ₹X
  • Highlights: Short key details.
- Avoid walls of plain text or long cluttered paragraphs. Keep responses concise, elegant, and skimmable.
- Use clean Markdown links where appropriate: [Plan My Trip](/plan/), [Explore Catalog](/explore/).
"""


def search_places_context(query: str) -> str:
    """Searches the TouristPlace database for relevant destinations matching user query terms."""
    query_clean = query.strip()
    if not query_clean or len(query_clean) < 2:
        return ""

    stop_words = {'best', 'places', 'place', 'visit', 'days', 'day', 'trip', 'for', 'the', 'and', 'with', 'near', 'under', 'budget', 'show', 'suggest', 'what', 'where', 'how', 'many', 'good', 'top'}
    words = [w.strip() for w in query_clean.split() if len(w.strip()) >= 3 and w.lower() not in stop_words]

    q_objects = Q()
    for word in words:
        q_objects |= (
            Q(name__icontains=word) |
            Q(city__icontains=word) |
            Q(state__icontains=word) |
            Q(category__icontains=word) |
            Q(tags__icontains=word)
        )

    if not q_objects:
        return ""

    places = TouristPlace.objects.filter(q_objects).order_by('-rating')[:5]

    if not places.exists():
        return ""

    context_items = []
    for p in places:
        context_items.append(
            f"• **{p.name}** ({p.city}, {p.state}) — *{p.category}*\n"
            f"  ⭐ {p.rating}★ | 💰 Est. Cost: ₹{round(p.estimated_cost)}/person\n"
            f"  📝 {p.short_description}\n"
        )
    return "\nVERIFIED DATABASE MATCHES:\n" + "\n".join(context_items)


def generate_fallback_bot_response(user_message: str, user=None) -> str:
    """
    Intelligent rule-based local assistant fallback when Gemini API key is missing or offline.
    """
    msg_lower = user_message.lower()

    # 1. Complaint & Technical Support
    if any(k in msg_lower for k in ['bug', 'issue', 'problem', 'error', 'not working', 'cant open', 'cannot open', 'broken', 'complaint', 'fault', 'failed']):
        UserFeedback.objects.create(
            user=user if (user and user.is_authenticated) else None,
            category='Complaint',
            subject='Chatbot Issue Report',
            message=user_message,
            status='Pending'
        )
        return (
            "🛠️ **Support Report Registered**\n\n"
            "I'm sorry to hear about the issue! I have logged your report directly for our technical team.\n\n"
            "📌 **Quick Assistance:**\n"
            "• Please try refreshing the page or checking your browser connection.\n"
            "• You can also continue using [Plan My Trip](/plan/) or [Explore Catalog](/explore/)."
        )

    # 2. Feedback & Suggestions
    if any(k in msg_lower for k in ['feedback', 'suggestion', 'suggest place', 'improve', 'idea', 'feature request']):
        UserFeedback.objects.create(
            user=user if (user and user.is_authenticated) else None,
            category='Feedback',
            subject='Chatbot Feedback',
            message=user_message,
            status='Received'
        )
        return (
            "🎉 **Thank You for Your Feedback!**\n\n"
            "We have recorded your suggestion into our platform roadmap.\n"
            "Your inputs help make Yatra AI better for all travelers!"
        )

    # 3. Destination & Location Queries
    db_context = search_places_context(user_message)
    if db_context:
        lines = db_context.strip().split('\n')[1:] # Skip header
        reply = f"📍 **Top Destinations Matching Your Search ('{user_message}'):**\n\n"
        reply += "\n".join(lines)
        reply += "\n💡 **Next Step:** You can generate a full day-wise itinerary for these spots on our [AI Planner](/plan/)!"
        return reply

    # 4. Navigation & Website Feature Help
    if any(k in msg_lower for k in ['how to plan', 'plan trip', 'create trip', 'itinerary', 'wizard']):
        return (
            "🧭 **How to Plan Your Perfect Trip:**\n\n"
            "1. Click on [Plan My Trip](/plan/).\n"
            "2. Select your origin, destination, days (1-15), and budget (₹).\n"
            "3. Choose your companions and travel pace.\n"
            "4. Our AI will compute a custom day-wise itinerary and route map!"
        )

    if any(k in msg_lower for k in ['hidden gem', 'offbeat', 'sustainable', 'eco']):
        return (
            "🌿 **Explore Hidden Gems:**\n\n"
            "Discover pristine offbeat locations away from crowds in our [Hidden Gems](/hidden-gems/) section, complete with eco-scores and authentic homestays!"
        )

    if any(k in msg_lower for k in ['my trip', 'saved trip', 'bookmark', 'account']):
        return (
            "📂 **My Saved Trips:**\n\n"
            "You can manage your saved travel itineraries anytime on your [My Trips Dashboard](/my-trips/)."
        )

    if any(k in msg_lower for k in ['explore', 'search', 'destinations', 'filter', 'places catalog']):
        return (
            "🔍 **Discover 68+ Destinations:**\n\n"
            "Filter top spots across India by state, category, or maximum budget on our [Explore Catalog](/explore/)!"
        )

    # 5. General Greeting or Fallback
    if any(k in msg_lower for k in ['hi', 'hello', 'hey', 'namaste', 'greetings']):
        return (
            "Namaste! 🙏 Welcome to **Yatra AI**.\n\n"
            "I can help you discover destinations, compute day-wise travel itineraries, and optimize your budget.\n\n"
            "What would you like to explore today?"
        )

    return (
        "🤖 **I'm Here to Help!**\n\n"
        "Try asking questions like:\n"
        "• *'Best places in Rajasthan for 3 days?'*\n"
        "• *'Budget trip to Kerala under ₹12,000?'*\n"
        "• *'Top hidden gems in Himachal Pradesh?'*\n"
        "• *'How do I plan my trip?'*"
    )


def handle_chat_query(user_message: str, history: list = None, user=None) -> dict:
    if not user_message or not user_message.strip():
        return {"success": False, "reply": "Please enter a valid message."}

    user_message_clean = user_message.strip()[:1500]

    api_key = getattr(settings, 'GEMINI_API_KEY', '') or getattr(settings, 'AI_API_KEY', '') or os.getenv('GEMINI_API_KEY', '') or os.getenv('AI_API_KEY', '')
    model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-3.6-flash') or os.getenv('GEMINI_MODEL', 'gemini-3.6-flash')

    if not api_key or api_key == 'your_gemini_api_key_here':
        reply = generate_fallback_bot_response(user_message_clean, user=user)
        return {"success": True, "reply": reply, "source": "Rule Engine Fallback", "model": "Offline"}

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        db_extra_context = search_places_context(user_message_clean)

        system_instruction_full = SYSTEM_PROMPT
        if db_extra_context:
            system_instruction_full += f"\n{db_extra_context}\n"

        history_formatted = []
        if history and isinstance(history, list):
            for item in history[-6:]:
                role = item.get('role', 'user')
                content = item.get('content', '')
                if content:
                    history_formatted.append(f"{'User' if role=='user' else 'Assistant'}: {content}")

        history_str = "\n".join(history_formatted) if history_formatted else "No previous conversation history."
        prompt = f"RECENT CONVERSATION HISTORY:\n{history_str}\n\nCURRENT USER QUERY:\nUser: {user_message_clean}\nAssistant:"

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

        return {"success": True, "reply": reply_text, "source": "Google Gemini API", "model": model_name}

    except Exception as e:
        logger.error(f"Gemini API chat failed: {str(e)}")
        fallback_reply = generate_fallback_bot_response(user_message_clean, user=user)
        return {"success": True, "reply": fallback_reply, "source": "Fallback Engine"}
