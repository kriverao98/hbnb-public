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

  async function fetchPlaceDetails(endpointPath) {
  /* This function fetches the places API. */
    const placeDetailsApi = getApiUrl(endpointPath);

    try {
      const fetchRequest = await fetch (placeDetailsApi);

      if (!fetchRequest.ok) {
        throw new Error(`Request status: ${fetchRequest.status}`);
      }
      const fetchedData = await fetchRequest.json();
      console.log('Fetched place details:', fetchedData)
      return fetchedData;
    }
    catch (error) {
      console.error('Place details couldn\'t be fetched.', error);
    }
  }

  async function handleFetchAndDisplay(endpointPath) {
    try {
      const placeDetails = await fetchPlaceDetails(endpointPath);
      if (!placeDetails || placeDetails.length === 0) {
        throw new Error('No place details available.');
      }
  
      populatePlaceCard(placeDetails);
    } catch (error) {
      console.error('An error occurred while fetching and displaying data:', error.message);
    }
  }

  async function populatePlaceCard(place_details) {
    try {
      if (!place_details || place_details.length == 0) {
        throw new Error(`No place details available.`);
      }
      console.log('Place details to populate cards:', place_details);

      const cardsToShow = 3;
      const placesList = document.getElementById('places-list');
      placesList.innerHTML = '';

      place_details.slice(0, cardsToShow).forEach(place => {
        const detailsDiv = document.createElement('div');
        detailsDiv.setAttribute('class', 'place-card');

        detailsDiv.innerHTML = `
          <div class="place-info">
            <h2>${place.description}</h2>
            <p>Price per night: $${place.price_per_night}</p>
            <p>Location:${place.city_name}, ${place_details.country_name}</p>
            <a href="/place?place_id=${place.id}" class="button" data-id="${place.id}">View Details</a>
          </div>
            `;
        placesList.appendChild(detailsDiv);
      });
    }
    catch (error) {
      console.error('An error occurred', error.message);
    }
  }

  async function getPlacesID() {
    /* This function will fetch the place Id to be used in other functions */
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('place_id');
  };


  function getImagePath() {
    return [
      'base_files/images/place1.jpg',
      'base_files/images/place2.jpg',
      'base_files/images/place3.jpg',
      'base_files/images/default_img.png'
    ];
  }

  async function fetchPlacesDetailsId() {
    /* This function will fetch and dynamically display a place */
    try {
      const placeId = await getPlacesID();
      if (placeId) {
        const placeDetailsUrl = getApiUrl(`places/${placeId}`);

        const idRequest = await fetch (placeDetailsUrl);
        if (!idRequest.ok) {
          throw new Error('No details found.');
        }

        const placeData = await idRequest.json();
        updatePlaceDetailsUI(placeData);

        /* This will dynamically populate the place details section */
        const displayPlace = document.getElementById('place-details');
        displayPlace.innerHTML = '';
  
        const detailsDiv = document.createElement('div');
        detailsDiv.setAttribute('class', 'place-details');

        const imagePath = getImagePath();
        const selectedImagePath = imagePath[0] || imagePath[imagePath.length -1];

        detailsDiv.innerHTML = `
          <div class="place-details">
            <h1>${placeData.description}</h1>
          </div>
          <div class="place-image-large">
            <img src="${selectedImagePath}" alt="Place Image">
          </div>
          <div class="place-info">
            <p>Host: ${placeData.host_name}</p>
            <p>Price per night: ${placeData.price_per_night}</p>
            <p>Location: ${placeData.city_name}, ${placeData.country_name}</p>
            <p>Description: ${placeData.description}</p>
            <p>Amenities: ${placeData.amenities.join(', ')}</p>
          </div>
          `;
          displayPlace.appendChild(detailsDiv);

          /* This will dynamically populate the review section */
          const displayReview = document.getElementById('reviews');
          displayReview.innerHTML = '';
          if (placeData.reviews && placeData.reviews.length > 0) {
            placeData.reviews.forEach(review => {
              const reviewDiv = document.createElement('div');
              reviewDiv.setAttribute('class', 'review-card');
              reviewDiv.innerHTML = `
              <div class="review-card">
                <h1>Reviews</h1>
                <p>${review.user_name}</p>
                <p>${review.comment}</p>
                <p>${review.rating}</p>
              </div>
              `;
              displayReview.appendChild(reviewDiv);
            });
          }
          else {
            displayReview.innerHTML = `<p>No reviews available</p>`;
          }
      }
      else {
        console.error('Failed to retrieve place details.')
      }
    }
    catch (error) {
      console.error('An error occured.', error.message);
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed.');
  
    const pathname = window.location.pathname;
  
    // If on the index page
    if (pathname === '/' || pathname.includes('index.html')) {
      try {
        const place_details = await fetchPlaceDetails('/places');
        if (place_details) {
          populatePlaceCard(place_details);
        } else {
          console.log('No place details found.');
        }
      } catch (error) {
        console.error('Error fetching place details for index:', error);
      }
    }
  
    // If on the place.html page
    if (pathname.includes('place.html')) {
      try {
        await fetchPlacesDetailsId();
      } catch (error) {
        console.error('Error fetching place details for place.html:', error);
      }
    }
  
    // Event listener for dynamic buttons
    document.addEventListener('click', async (event) => {
      if (event.target.classList.contains('button')) {
        const endpointPath = getDynamicEndpoint(event);
        if (endpointPath) {
          await handleFetchAndDisplay(endpointPath);
        }
      }
    });
  
    console.log('JavaScript file is loaded.');
  });
  