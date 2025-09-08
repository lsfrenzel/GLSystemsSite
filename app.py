import os
import json
import logging
from flask import Flask

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "gl-systems-secret-key-2025")

# Add custom filter for JSON conversion
@app.template_filter('tojsonfilter')
def tojson_filter(obj):
    return json.dumps(obj, ensure_ascii=False)

# Import routes
from routes import *

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
