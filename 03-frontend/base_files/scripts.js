/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

async function fetchPlace_details() {
  const placeDetailsApi = "/places";

  try {
    const fetchRequest = await fetch (placeDetailsApi);

    if (!fetchRequest.ok) {
      throw new Error(`Request status: ${fetchRequest.status}`);
    }
    const fetchedData = await fetchRequest.json();
    console.log(fetchedData);
  }
  catch (error) {
    console.error('Place details couldn\'t be fetched', error);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  
});
