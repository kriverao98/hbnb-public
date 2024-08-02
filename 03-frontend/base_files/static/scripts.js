/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

function getDynamicEndpoint(event) {
  const button = event.target;
  const endpointPath = button.getAttribute('data-endpoint');
  console.log('Retrieved endpoint:', endpointPath);
  return endpointPath;
}

function getApiUrl(endpointPath) {
  /* Function to dynamically get the API endpoint needed */
  const apiBaseUrl = window.location.origin;
  return `${apiBaseUrl}/${endpointPath}`;
}

async function fetchPlaceDetailsApi(endpointPath) {
  /* This function fetches the places API. */
  const placeDetailsApi = getApiUrl(endpointPath);

  try {
    const fetchRequest = await fetch(placeDetailsApi);

    if (!fetchRequest.ok) {
      throw new Error(`Request status: ${fetchRequest.status}`);
    }
    const fetchedData = await fetchRequest.json();
    console.log('Fetched place details:', fetchedData);
    return fetchedData;
  } catch (error) {
    console.error('Place details couldn\'t be fetched.', error);
  }
}

async function handleFetchAndDisplay(endpointPath) {
  try {
    const placeDetails = await fetchPlaceDetailsApi(endpointPath);
    if (!placeDetails || placeDetails.length === 0) {
      throw new Error('No place details available.');
    }

    populatePlaceCard(placeDetails);
  } catch (error) {
    console.error('An error occurred while fetching and displaying data:', error.message);
  }
}

async function loadAndFilterCountries() {
  try {
    const countryData = await fetchPlaceDetailsApi('countries');
    if (!countryData) {
      throw new Error('Country details couldn\'t be loaded.');
    }

    const countryFilter = document.getElementById('country-filter');
    countryFilter.innerHTML = '<option value="All">All</option>';
    
    countryData.forEach(country => {
      const option = document.createElement('option');
      option.value = country.code;
      option.textContent = `${country.name} (${country.code})`;
      countryFilter.appendChild(option);
    });

    // Event listener to filter places based on selected country
    countryFilter.addEventListener('change', async (event) => {
      const selectedCountry = event.target.value;
      try {
        const placeDetails = await fetchPlaceDetailsApi('places');
        if (!placeDetails) {
          throw new Error('Place details couldn\'t be loaded.');
        }

        const filteredPlaces = placeDetails.filter(place => 
          selectedCountry === 'All' || place.country_code === selectedCountry
        );

        populatePlaceCard(filteredPlaces);
      } catch (error) {
        console.error('An error occurred while fetching and filtering places:', error.message);
      }
    });
  } catch (error) {
    console.error('Error loading countries:', error.message);
  }
}

async function filterCountry(event) {
  const selectedCountry = event.target.value;

  try {
    const placeDetails = await fetchPlaceDetailsApi('places');
    if (!placeDetails) {
      throw new Error('Place details couldn\'t be loaded.');
    }

    const filteredPlaces = placeDetails.filter(place =>
      selectedCountry === 'All' || place.country_code === selectedCountry
    );

    populatePlaceCard(filteredPlaces);
  } catch (error) {
    console.error('An error occurred while filtering places:', error.message);
  }
}

async function populatePlaceCard(place_details) {
  try {
    const placesList = document.getElementById('places-list');
    if (!place_details || place_details.length == 0) {
      placesList.innerHTML = '<h2>No places available in this country.</h2>';
      return;
    }

    placesList.innerHTML = '';

    place_details.forEach(place => {
      const detailsDiv = document.createElement('div');
      detailsDiv.setAttribute('class', 'place-card');
      detailsDiv.innerHTML = `
        <div class="place-info">
          <h2>${place.description}</h2>
          <p>Price per night: $${place.price_per_night}</p>
          <p>Location: ${place.city_name}, ${place.country_name}</p>
          <a href="/place?place_id=${place.id}" class="button" data-id="${place.id}">View Details</a>
        </div>
      `;
      placesList.appendChild(detailsDiv);
    });

    placesList.classList.add('horizontal-scroll');
  } catch (error) {
    console.error('An error occurred', error.message);
  }
}

function getPlaceIdFromURL() {
  /* This function extracts the place ID from the URL */
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('place_id');
}

async function fetchPlacesDetailsId() {
  try {
    const placeId = getPlaceIdFromURL();
    if (placeId) {
      const placeDetailsUrl = getApiUrl(`places/${placeId}`);

      const idRequest = await fetch(placeDetailsUrl);
      if (!idRequest.ok) {
        throw new Error('No details found.');
      }

      const placeData = await idRequest.json();

      // Populate place details section with place data
      const displayPlace = document.getElementById('place-details');
      displayPlace.innerHTML = `
        <div class="place-details">
          <h1>${placeData.description}</h1>
          <div class="place-info">
            <p>Host: ${placeData.host_name}</p>
            <p>Price per night: ${placeData.price_per_night}</p>
            <p>Location: ${placeData.city_name}, ${placeData.country_name}</p>
            <p>Description: ${placeData.description}</p>
            <p>Amenities: ${placeData.amenities.join(', ')}</p>
          </div>
        </div>
      `;

      // Populate review section with place reviews
      const displayReview = document.getElementById('reviews');
      displayReview.innerHTML = '';
      const title = document.createElement('h1');
      title.textContent = 'Reviews';
      displayReview.appendChild(title);

      if (placeData.reviews && placeData.reviews.length > 0) {
        placeData.reviews.forEach(review => {
          const reviewDiv = document.createElement('div');
          reviewDiv.setAttribute('class', 'review-card');
          reviewDiv.innerHTML = `
            <div class="review-card">
              <p>${review.user_name}</p>
              <p>${review.comment}</p>
              <p>${review.rating}</p>
            </div>
          `;
          displayReview.appendChild(reviewDiv);
        });
      } else {
        displayReview.innerHTML += '<p>No reviews available</p>';
      }
    } else {
      console.error('Failed to retrieve place details.');
    }
  } catch (error) {
    console.error('An error occurred.', error.message);
  }
}

async function loginUser(email, password) {
  // Log in page
  try {
    const fetchLogInUrl = getApiUrl('login');
    console.log('Fetching login URL:', fetchLogInUrl);

    const loginResponse = await fetch(fetchLogInUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    console.log('Login response status:', loginResponse.status);

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      console.log('Login successful, data:', data);
      document.cookie = `token=${data.access_token}; path=/`;
      window.location.href = '/';
    } else {
      const error = await loginResponse.text();
      console.log('Login failed response text:', error);
      alert('Login failed: ' + error);
    }
  } catch (error) {
    console.error('Error during login:', error);
    alert('An unexpected error occurred. Please try again later.');
  }
}

function getCookie(name) {
  // Get cookie
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length == 2) return parts.pop().split(';').shift();
}

async function submitReview(token, placeId, reviewText) {
  try {
      const response = await fetch(getApiUrl(`places/${placeId}/reviews`), {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
              review: reviewText,
              rating: 5  // Include rating if needed
          })
      });

      handleResponse(response);
  } catch (error) {
      console.error('Error submitting review:', error);
      alert('An error occurred. Please try again later.');
  }
}

function handleResponse(response) {
  if (response.ok) {
      alert('Review submitted successfully!');
      document.getElementById('review-form').reset();  // Clear the form
  } else {
      alert('Failed to submit review');
  }
}

// DOMContentLoaded Event Listener
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM fully loaded and parsed.');

  // Initialize country filter and load country data
  await loadAndFilterCountries();

  const pathname = window.location.pathname;

  // Load and display place cards on the index page
  if (pathname === '/' || pathname.includes('index.html')) {
    try {
      const place_details = await fetchPlaceDetailsApi('places');
      if (place_details) {
        populatePlaceCard(place_details);
      } else {
        console.log('No place details found.');
      }
    } catch (error) {
      console.error('Error fetching place details for index:', error);
    }
  }

  // Load and display place details on the place page
  if (pathname === '/place' || pathname.includes('place.html')) {
    try {
      await fetchPlacesDetailsId();
    } catch (error) {
      console.error('Error fetching place details for place.html:', error);
    }
  }

  // Event listener to handle button clicks dynamically
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('button')) {
      const endpointPath = getDynamicEndpoint(event);
      if (endpointPath) {
        await handleFetchAndDisplay(endpointPath);
      }
    }
  });

  // Event listener to handle login form submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      await loginUser(email, password);
    });
  }

  console.log('JavaScript file is loaded.');
});
