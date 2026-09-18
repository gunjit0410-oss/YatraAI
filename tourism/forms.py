from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

INTEREST_CHOICES = [
    ('History', 'History & Heritage'),
    ('Nature', 'Nature & Eco-Trails'),
    ('Adventure', 'Adventure & Outdoors'),
    ('Culture', 'Culture & Traditions'),
    ('Food', 'Food & Culinary Experiences'),
    ('Spirituality', 'Spirituality & Pilgrimage'),
    ('Wildlife', 'Wildlife & Flora'),
    ('Photography', 'Photography & Scenic Views'),
    ('Shopping', 'Local Markets & Craft Shopping'),
    ('Relaxation', 'Relaxation & Wellness'),
]

TRAVEL_TYPE_CHOICES = [
    ('Solo', 'Solo Traveler'),
    ('Couple', 'Couple'),
    ('Family', 'Family with Kids/Elderly'),
    ('Friends', 'Friends / Group'),
]

PACE_CHOICES = [
    ('Relaxed', 'Relaxed (1-2 places/day)'),
    ('Balanced', 'Balanced (2-3 places/day)'),
    ('Fast-paced', 'Fast-Paced (3-4 places/day)'),
]

class PlanTripForm(forms.Form):
    starting_location = forms.CharField(
        max_length=100,
        initial="New Delhi",
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. New Delhi, Mumbai, Bengaluru'})
    )
    destination = forms.CharField(
        max_length=100,
        initial="Rajasthan",
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'State or City (e.g., Rajasthan, Kerala, Goa)'})
    )
    num_days = forms.IntegerField(
        min_value=1,
        max_value=15,
        initial=4,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'min': 1, 'max': 15})
    )
    budget = forms.FloatField(
        min_value=1000,
        initial=15000,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Approximate Budget in ₹'})
    )
    travel_type = forms.ChoiceField(
        choices=TRAVEL_TYPE_CHOICES,
        initial='Friends',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    travel_pace = forms.ChoiceField(
        choices=PACE_CHOICES,
        initial='Balanced',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    interests = forms.MultipleChoiceField(
        choices=INTEREST_CHOICES,
        widget=forms.CheckboxSelectMultiple(attrs={'class': 'form-check-input'}),
        initial=['History', 'Culture', 'Food']
    )
    prefer_hidden_gems = forms.BooleanField(
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )


class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'class': 'form-control'}))

    class Meta(UserCreationForm.Meta):
        model = User
        fields = UserCreationForm.Meta.fields + ('email',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs['class'] = 'form-control'
