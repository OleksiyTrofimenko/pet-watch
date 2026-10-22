// runScript helper: the owner invites a registered user to a pet through the API (sends the email).
// Input env:  ACCESS_TOKEN (the owner's, from api.js output), PET_ID, EMAIL, API_URL (optional).
// Then read the link with mailpit.js.
const apiUrl = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000';

const response = http.post(apiUrl + '/pets/' + PET_ID + '/invitations', {
  headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + ACCESS_TOKEN },
  body: JSON.stringify({ email: EMAIL }),
});
if (response.status !== 200) {
  throw new Error('invite ' + EMAIL + ' failed: ' + response.status + ' ' + response.body);
}
