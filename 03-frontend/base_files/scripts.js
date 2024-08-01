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
    const displayCard = document.getElementsByClassName('place_card');
    if (!displayCard) {
      throw new Error(`Display card is empty.`)
    }
    else {
      return displayCard
    }
  }
  catch {
    console.error(`An error occurred:`, error.message);
  }
  }

  async function populatePlaceCard() {
    try {
      const place_details = await fetchPlaceDetails();

      if (!place_details) {
        throw new Error(`Place details could not be loaded.`);
      }
      else {
        const detailsDiv = document.createElement('div');
        const base_files = "base_files/images"
        detailsDiv.setAttribute('class', 'place-card');

        detailsDiv.innerHTML = `
        <img src="${base_files}/images" class="place-image-large"
        alt="Large Place Image">
        <div class="place-info">
          <h3>${place_details.description}</h3>
          <p>Price per night:${place_details.price_per_night}</p>
          <p>Location:${place_details.city_name} + ${place_details.country_name}</P>
        `;
        document.body.appendChild(detailsDiv);
      }
    }
    catch {
      console.error('An error occurred', error.message);
    }
  };

document.addEventListener('DOMContentLoaded', () => {
  fetchPlace_details();
  cardsDisplay();
  populateHost();
});
