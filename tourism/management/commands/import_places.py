import csv
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from tourism.models import TouristPlace

class Command(BaseCommand):
    help = 'Imports sample tourist places from data/tourist_places.csv into SQLite database.'

    def handle(self, *args, **options):
        csv_path = settings.BASE_DIR / 'data' / 'tourist_places.csv'
        if not os.path.exists(csv_path):
            self.stderr.write(self.style.ERROR(f"CSV file not found at {csv_path}"))
            return

        imported_count = 0
        updated_count = 0

        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                place, created = TouristPlace.objects.update_or_create(
                    name=row['name'].strip(),
                    city=row['city'].strip(),
                    defaults={
                        'state': row['state'].strip(),
                        'category': row['category'].strip(),
                        'description': row['description'].strip(),
                        'short_description': row['short_description'].strip(),
                        'best_time': row['best_time'].strip(),
                        'estimated_cost': float(row['estimated_cost']),
                        'recommended_duration': float(row['recommended_duration']),
                        'latitude': float(row['latitude']),
                        'longitude': float(row['longitude']),
                        'rating': float(row['rating']),
                        'image_url': row['image_url'].strip(),
                        'tags': row['tags'].strip(),
                        'is_hidden_gem': row['is_hidden_gem'].strip().lower() in ('true', '1', 'yes'),
                        'sustainability_score': float(row['sustainability_score']),
                    }
                )
                if created:
                    imported_count += 1
                else:
                    updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully imported data! Created: {imported_count}, Updated: {updated_count}. Total in DB: {TouristPlace.objects.count()}"
            )
        )
