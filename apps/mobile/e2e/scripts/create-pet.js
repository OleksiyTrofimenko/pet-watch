// runScript helper: creates a pet through the API (setup without clicking through screens).
// Input env:  ACCESS_TOKEN (from api.js output), NAME, SPECIES, API_URL (optional).
// Output:     output.petId
const apiUrl = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000';

const response = http.post(apiUrl + '/pets', {
  headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + ACCESS_TOKEN },
  body: JSON.stringify({ name: NAME, species: SPECIES }),
});
if (response.status !== 201) {
  throw new Error('create pet ' + NAME + ' failed: ' + response.status + ' ' + response.body);
}
output.petId = json(response.body).id;
