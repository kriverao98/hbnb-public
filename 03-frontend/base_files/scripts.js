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

  async function populateHost(host_name) {
    try {
      const place_details = await fetchPlaceDetails();

      if (!place_details) {
        throw new Error(`Place details could not be loaded.`);
      }
      const firstPlace = placeDetails[0];
      const detailsContainer = document.querySelector('.place-details');
      if (detailsContainer) {
        detailsContainer.innerHTML = 
      }
    }

  };

document.addEventListener('DOMContentLoaded', () => {
  fetchPlace_details();
  populateHost();
});
