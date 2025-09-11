import os
import json
import logging
from flask import Flask, session, request
from translations import get_translation, get_all_translations

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

# Add custom filter for JSON conversion
@app.template_filter('tojsonfilter')
def tojson_filter(obj):
    return json.dumps(obj, ensure_ascii=False)

# Add translation functions to template context
@app.context_processor
def inject_translations():
    current_lang = session.get('language', 'pt')
    return {
        't': lambda key: get_translation(key, current_lang),
        'lang': current_lang,
        'translations': get_all_translations(current_lang)
    }

# Language detection and setting
@app.before_request
def before_request():
    # Set default language if not set
    if 'language' not in session:
        # Try to detect browser language
        browser_lang = request.headers.get('Accept-Language', '').lower()
        if browser_lang.startswith('en'):
            session['language'] = 'en'
        else:
            session['language'] = 'pt'

# Import routes
from routes import *

