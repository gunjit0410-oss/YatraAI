from django.db import models
from django.contrib.auth.models import User

class TouristPlace(models.Model):
    CATEGORY_CHOICES = [
        ('Heritage', 'Heritage & Architecture'),
        ('Nature', 'Nature & Eco-Tourism'),
        ('Adventure', 'Adventure & Outdoors'),
        ('Culture', 'Culture & Local Life'),
        ('Spiritual', 'Spiritual & Pilgrimage'),
        ('Food', 'Food & Culinary'),
        ('Wildlife', 'Wildlife & Sanctuaries'),
        ('Beach', 'Beach & Coastal'),
        ('Hill Station', 'Hill Station & Mountains'),
    ]

    name = models.CharField(max_length=200, db_index=True)
    state = models.CharField(max_length=100, db_index=True)
    city = models.CharField(max_length=100, db_index=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, db_index=True)
    description = models.TextField()
    short_description = models.CharField(max_length=300)
    best_time = models.CharField(max_length=100, help_text="e.g. October to March")
    estimated_cost = models.FloatField(default=500.0, help_text="Estimated cost per person in INR")
    recommended_duration = models.FloatField(default=3.0, help_text="Recommended duration in hours")
    latitude = models.FloatField()
    longitude = models.FloatField()
    rating = models.FloatField(default=4.5)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    tags = models.CharField(max_length=255, help_text="Pipe or comma separated keywords, e.g. History|Culture|Photography")
    is_hidden_gem = models.BooleanField(default=False, db_index=True)
    sustainability_score = models.FloatField(default=8.0, help_text="Eco score out of 10")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-rating', 'name']
        verbose_name = 'Tourist Place'
        verbose_name_plural = 'Tourist Places'

    def __str__(self):
        return f"{self.name} ({self.city}, {self.state})"

    @property
    def tag_list(self):
        if not self.tags:
            return []
        # split by pipe or comma
        raw = self.tags.replace(',', '|').split('|')
        return [t.strip() for t in raw if t.strip()]


class SavedTrip(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_trips', null=True, blank=True)
    trip_name = models.CharField(max_length=200)
    starting_location = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    num_days = models.IntegerField(default=3)
    budget = models.FloatField(default=15000.0)
    travel_type = models.CharField(max_length=50, default='Friends')
    travel_pace = models.CharField(max_length=50, default='Balanced')
    interests = models.CharField(max_length=255)
    selected_places = models.ManyToManyField(TouristPlace, related_name='trips')
    itinerary_json = models.JSONField(default=dict)
    total_estimated_cost = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.trip_name} - {self.destination} ({self.num_days} Days)"


class Favourite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favourites')
    place = models.ForeignKey(TouristPlace, on_delete=models.CASCADE, related_name='favourited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'place')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.place.name}"


class UserFeedback(models.Model):
    CATEGORY_CHOICES = [
        ('Complaint', 'Complaint / Technical Issue'),
        ('Feedback', 'General Feedback'),
        ('Suggestion', 'Feature Suggestion'),
        ('Destination', 'Destination Recommendation'),
    ]
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='feedbacks')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Feedback')
    subject = models.CharField(max_length=200, blank=True, default='User Inquiry')
    message = models.TextField()
    contact_email = models.EmailField(blank=True, null=True)
    status = models.CharField(max_length=20, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.category}: {self.subject} ({self.created_at.strftime('%Y-%m-%d')})"

