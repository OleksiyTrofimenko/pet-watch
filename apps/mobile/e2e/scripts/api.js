// runScript helper: registers a user through the API (setup without clicking through screens).
// Input env:  EMAIL, PASSWORD, API_URL (optional, default http://localhost:3000).
// Output:     output.accessToken, output.refreshToken, output.userId
// Maestro runs scripts on the host, so localhost reaches the API even for the Android emulator.
const apiUrl = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000';

const response = http.post(apiUrl + '/auth/register', {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
if (response.status !== 201) {
  throw new Error('register ' + EMAIL + ' failed: ' + response.status + ' ' + response.body);
}

const auth = json(response.body);
output.accessToken = auth.accessToken;
output.refreshToken = auth.refreshToken;
output.userId = auth.user.id;
