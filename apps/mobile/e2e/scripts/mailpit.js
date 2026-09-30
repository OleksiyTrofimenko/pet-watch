// runScript helper: the newest petwatch:// link in the latest email to EMAIL.
// Input env:  EMAIL, MAILPIT_URL (optional, default http://localhost:8025).
// Output:     output.link, e.g. petwatch://reset-password?token=…  (then: - openLink: ${output.link})
// The API sends mail without awaiting it, so wrap the call in `- retry: { maxRetries: 3, commands: [...] }`
// when it runs right after the action that triggers the email.
const mailpitUrl = typeof MAILPIT_URL !== 'undefined' ? MAILPIT_URL : 'http://localhost:8025';

const search = http.get(
  mailpitUrl + '/api/v1/search?query=' + encodeURIComponent('to:"' + EMAIL + '"'),
);
const messages = json(search.body).messages;
if (!messages || messages.length === 0) throw new Error('No email to ' + EMAIL);

const message = json(http.get(mailpitUrl + '/api/v1/message/' + messages[0].ID).body);
const match = /petwatch:\/\/[^\s<>"')]+/.exec(message.Text);
if (!match) throw new Error('No petwatch:// link in email to ' + EMAIL);
output.link = match[0];
