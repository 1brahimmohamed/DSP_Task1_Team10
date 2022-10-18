import numpy as np
from flask import Flask, Response, request, jsonify, render_template, make_response
from flask_cors import CORS

# Create flask application
app = Flask(__name__)

# Cross-origin resource sharing error handling
CORS(app)
cors = CORS(app, resources={
    r"/*": {
        'origins': '*'
    }
})


# home route
@app.route('/')
def home():
    return render_template('index.html')


if __name__ == "__main__":
    app.run(debug=True)
