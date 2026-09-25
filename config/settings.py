import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-sih-yatra-ai-key-prototype-2026')

DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 't')

# Allowed Hosts & CSRF Settings for Vercel & Production
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')
ALLOWED_HOSTS.extend(['.vercel.app', '.now.sh', 'localhost', '127.0.0.1'])
ALLOWED_HOSTS = list(set([h.strip() for h in ALLOWED_HOSTS if h.strip()]))

CSRF_TRUSTED_ORIGINS = [
    'https://*.vercel.app',
    'https://*.now.sh',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]
extra_csrf = os.getenv('CSRF_TRUSTED_ORIGINS', '')
if extra_csrf:
    CSRF_TRUSTED_ORIGINS.extend([origin.strip() for origin in extra_csrf.split(',') if origin.strip()])



INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'tourism',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database Configuration (Supports Local SQLite, Vercel Serverless /tmp SQLite, and PostgreSQL via DATABASE_URL)
IS_VERCEL = 'VERCEL' in os.environ or os.getenv('SERVERLESS') == '1'

if os.getenv('DATABASE_URL'):
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.config(
            default=os.getenv('DATABASE_URL'),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
elif IS_VERCEL:
    # On Vercel, /var/task is read-only. Copy database to /tmp if it exists
    TMP_DB = Path('/tmp/db.sqlite3')
    ORIGINAL_DB = BASE_DIR / 'db.sqlite3'

    if ORIGINAL_DB.exists() and not TMP_DB.exists():
        try:
            import shutil
            shutil.copyfile(ORIGINAL_DB, TMP_DB)
        except Exception as e:
            print("Failed to copy original db.sqlite3 to /tmp:", e)

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': TMP_DB if (TMP_DB.exists() or not ORIGINAL_DB.exists()) else ORIGINAL_DB,
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = Path('/tmp/staticfiles') if IS_VERCEL else (BASE_DIR / 'staticfiles')

# WhiteNoise Configuration for Vercel & Production Static File Serving
WHITENOISE_USE_FINDERS = True
WHITENOISE_AUTOREFRESH = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'my_trips'
LOGOUT_REDIRECT_URL = 'home'

# AI Integration settings
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '') or os.getenv('AI_API_KEY', '')
AI_API_KEY = GEMINI_API_KEY
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-3.6-flash')



