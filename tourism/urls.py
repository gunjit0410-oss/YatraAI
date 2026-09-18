from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('explore/', views.explore_view, name='explore'),
    path('place/<int:pk>/', views.place_detail_view, name='place_detail'),
    path('plan/', views.plan_trip_view, name='plan_trip'),
    path('recommendations/', views.recommendations_view, name='recommendations'),
    path('itinerary/', views.itinerary_view, name='itinerary'),
    path('save-trip/', views.save_trip_view, name='save_trip'),
    path('my-trips/', views.my_trips_view, name='my_trips'),
    path('saved-trip/<int:pk>/', views.saved_trip_detail_view, name='saved_trip_detail'),
    path('delete-trip/<int:pk>/', views.delete_trip_view, name='delete_trip'),
    path('hidden-gems/', views.hidden_gems_view, name='hidden_gems'),
    path('category/<str:category_slug>/', views.category_detail_view, name='category_detail'),
    path('toggle-favourite/<int:place_id>/', views.toggle_favourite_view, name='toggle_favourite'),

    # Auth
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),

    # REST API
    path('api/destinations/', views.api_destinations_list, name='api_destinations_list'),
    path('api/places/', views.api_places_list, name='api_places_list'),
]

