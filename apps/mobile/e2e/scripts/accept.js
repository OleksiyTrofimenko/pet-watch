// runScript helper: the invitee accepts an emailed invite through the API (setup for watcher flows).
// Input env:  ACCESS_TOKEN (the invitee's, from api.js output), LINK (from mailpit.js), API_URL (optional).
const apiUrl = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000';
const token = LINK.split('/invites/')[1];

const response = http.post(apiUrl + '/invitations/' + encodeURIComponent(token) + '/accept', {
  headers: { Authorization: 'Bearer ' + ACCESS_TOKEN },
});
if (response.status !== 200) {
  throw new Error('accept failed: ' + response.status + ' ' + response.body);
}
