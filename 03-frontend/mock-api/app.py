from flask import Flask, render_template, redirect, url_for, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import json
from uuid import uuid4
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, '..', 'base_files', 'templates')
STATIC_DIR = os.path.join(BASE_DIR, '..', 'base_files', 'static')

app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)
app.config.from_object('config.Config')

CORS(app, resources={r"/*": {"origins": "*"}})
jwt = JWTManager(app)

with open('data/users.json') as f:
    users = json.load(f)

with open('data/places.json') as f:
    places = json.load(f)

with open('data/countries.json') as f:
    countries = json.load(f)

# In-memory storage for new reviews
new_reviews = []

import json

def update_countries_from_places():
    try:
        # Read places data
        with open('data/places.json', 'r') as f:
            places_data = json.load(f)
        
        # Read current countries data
        with open('data/countries.json', 'r') as f:
            countries_data = json.load(f)
        
        # Extract unique countries from places data
        unique_countries = set()
        for place in places_data:
            country_name = place.get('country_name')
            country_code = place.get('country_code')
            if country_name and country_code:
                unique_countries.add((country_name, country_code))

        # Convert set to list of dictionaries
        new_countries = [{'code': code, 'name': name} for name, code in unique_countries]
        
        # Combine existing countries with new ones, ensuring no duplicates
        existing_countries_set = set()
        for c in countries_data:
            code = c.get('code')
            name = c.get('name')
            if code and name:
                existing_countries_set.add((code, name))
            else:
                print(f"Skipping invalid country entry: {c}")
        
        all_countries = [{'code': code, 'name': name} for code, name in existing_countries_set.union(unique_countries)]
        
        # Write updated countries data
        with open('data/countries.json', 'w') as f:
            json.dump(all_countries, f, indent=4)
        
        return True, len(all_countries)

    except Exception as e:
        print(f'Error updating countries: {e}')
        return False, str(e)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = next((u for u in users if u['email'] == email and u['password'] == password), None)
        if not user:
            print(f"User not found or invalid password for: {email}")
            return jsonify({"msg": "Invalid credentials"}), 401

        access_token = create_access_token(identity=user['id'])
        return jsonify({"access_token": access_token}), 200

    elif request.method == 'GET':
        return render_template('login.html')

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/place', methods=['GET'])
def place():
    place_id = request.args.get('place_id')
    if not place_id:
        return "Place ID is required", 400
    place = next((p for p in places if p['id'] == place_id), None)

    if not place:
        return "Place not found", 404

    return render_template('place.html', place_id=place_id)

@app.route('/places', methods=['GET'])
def get_places():
    response = [
        {
            "id": place['id'],
            "host_id": place['host_id'],
            "host_name": place['host_name'],
            "description": place['description'],
            "price_per_night": place['price_per_night'],
            "city_id": place['city_id'],
            "city_name": place['city_name'],
            "country_code": place['country_code'],
            "country_name": place['country_name']
        }
        for place in places
    ]
    return jsonify(response)

@app.route('/places/<place_id>', methods=['GET'])
def get_place(place_id):
    place = next((p for p in places if p['id'] == place_id), None)

    if not place:
        return jsonify({"msg": "Place not found"}), 404

    response = {
        "id": place['id'],
        "host_id": place['host_id'],
        "host_name": place['host_name'],
        "description": place['description'],
        "number_of_rooms": place['number_of_rooms'],
        "number_of_bathrooms": place['number_of_bathrooms'],
        "max_guests": place['max_guests'],
        "price_per_night": place['price_per_night'],
        "latitude": place['latitude'],
        "longitude": place['longitude'],
        "city_id": place['city_id'],
        "city_name": place['city_name'],
        "country_code": place['country_code'],
        "country_name": place['country_name'],
        "amenities": place['amenities'],
        "reviews": place['reviews'] + [r for r in new_reviews if r['place_id'] == place_id]
    }
    return jsonify(response)

@app.route('/places/<place_id>/reviews', methods=['POST'])
@jwt_required()
def add_review(place_id):
    current_user_id = get_jwt_identity()
    user = next((u for u in users if u['id'] == current_user_id), None)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    review_text = request.json.get('review')
    rating = request.json.get('rating')

    if not review_text or not rating:
        return jsonify({"msg": "Review text and rating are required"}), 400

    try:
        rating = int(rating)
    except ValueError:
        return jsonify({"msg": "Rating must be an integer"}), 400

    if rating < 1 or rating > 5:
        return jsonify({"msg": "Rating must be between 1 and 5"}), 400

    # Create new review
    new_review = {
        "user_name": user['name'],
        "rating": rating,
        "comment": review_text,
        "place_id": place_id
    }

    # Append the new review (assuming new_reviews is a list)
    new_reviews.append(new_review)
    return jsonify({"msg": "Review added"}), 201

@app.route('/countries', methods=['GET'])
def get_countries():
    try:
        return jsonify(countries)
    except Exception as e:
        print(f"Error fetching countries: {e}")
        return jsonify({"msg": "Unable to fetch countries data"}), 500

@app.route('/update-countries', methods=['GET', 'POST'])
def update_countries():
    success, result = update_countries_from_places()
    if success:
        return jsonify({'message': 'Countries updated successfully.', 'total_countries': result}), 200
    else:
        return jsonify({'message': 'Error updating countries.', 'error': result}), 500


if __name__ == '__main__':
    app.run(debug=True)