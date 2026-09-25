from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('favicon.ico', RedirectView.as_view(url='/static/images/logo.png', permanent=True)),
    path('favicon.png', RedirectView.as_view(url='/static/images/logo.png', permanent=True)),
    path('', include('tourism.urls')),
]

