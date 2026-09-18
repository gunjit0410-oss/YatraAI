from django.contrib import admin
from .models import TouristPlace, SavedTrip, Favourite

@admin.register(TouristPlace)
class TouristPlaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'state', 'category', 'estimated_cost', 'rating', 'is_hidden_gem', 'sustainability_score')
    list_filter = ('category', 'state', 'is_hidden_gem')
    search_fields = ('name', 'city', 'state', 'tags', 'description')
    list_editable = ('is_hidden_gem', 'rating', 'estimated_cost')
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'city', 'state', 'category', 'short_description', 'description')
        }),
        ('Travel Logistics', {
            'fields': ('best_time', 'estimated_cost', 'recommended_duration', 'image_url')
        }),
        ('Location & Coordinates', {
            'fields': ('latitude', 'longitude')
        }),
        ('Ratings & Sustainability', {
            'fields': ('rating', 'tags', 'is_hidden_gem', 'sustainability_score')
        }),
    )


@admin.register(SavedTrip)
class SavedTripAdmin(admin.ModelAdmin):
    list_display = ('trip_name', 'user', 'destination', 'num_days', 'budget', 'total_estimated_cost', 'created_at')
    list_filter = ('destination', 'travel_type', 'created_at')
    search_fields = ('trip_name', 'destination', 'starting_location', 'user__username')


@admin.register(Favourite)
class FavouriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'place', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'place__name')
