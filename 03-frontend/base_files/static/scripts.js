/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

  async function fetchPlaceDetails() {
/*
This function fetches the places API.
*/
    const placeDetailsApi = "http://127.0.0.1:5000/places";

    try {
      const fetchRequest = await fetch (placeDetailsApi);

      if (!fetchRequest.ok) {
        throw new Error(`Request status: ${fetchRequest.status}`);
      }
      const fetchedData = await fetchRequest.json();
      return fetchedData;
    }
    catch (error) {
      console.error('Place details couldn\'t be fetched.', error);
    }
  };

  async function cardsDisplay() {
  /*Function to display cards using place-card */
  try {
    const place_details = await fetchPlaceDetails();

    if (!place_details) {
      throw new Error(`Place details could not be loaded.`);
    }
    const displayCard = document.getElementsByClassName('places-card');
    if (displayCard.length == 0) {
      throw new Error(`Display card is empty.`)
    }
    return displayCard
  }
  catch (error) {
    console.error(`An error occurred:`, error.message);
  }
  }

  async function populatePlaceCard() {
    try {
      const place_details = await fetchPlaceDetails();

      if (!place_details || place_details.length == 0) {
        throw new Error(`No place details available.`);
      }

      const cardsToShow = 3;
      const placesList = document.getElementById('places-list');
      placesList.innerHTML = '';

      place_details.slice(0, cardsToShow).forEach(place => {
        const detailsDiv = document.createElement('div');
        detailsDiv.setAttribute('class', 'place-card');

        detailsDiv.innerHTML = `
          <div class="place-info">
            <h3>${place.description}</h3>
            <p>Price per night: $${place.price_per_night}</p>
            <p>Location:${place.city_name}, ${place_details.country_name}</p>
            <a href="/place/${place.id}" class="details-button">View Details</a>
          </div>
            `;
        placesList.appendChild(detailsDiv);
      });
    }
    catch (error) {
      console.error('An error occurred', error.message);
    }
  };

document.addEventListener('DOMContentLoaded', () => {
  fetchPlaceDetails();
  cardsDisplay();
  populatePlaceCard();
});
