import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()

# Auto-seed database if running on Vercel with an uninitialized /tmp/db.sqlite3
if os.getenv('VERCEL') or os.getenv('SERVERLESS') == '1':
    try:
        from django.core.management import call_command
        from django.db import connection
        
        # Ensure database tables exist in /tmp/db.sqlite3
        table_names = connection.introspection.table_names()
        if 'tourism_touristplace' not in table_names:
            call_command('migrate', interactive=False)
            call_command('import_places')
    except Exception as e:
        print("Auto-migration on Vercel exception:", e)
