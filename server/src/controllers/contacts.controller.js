import { google } from 'googleapis';

export const getGoogleContacts = async (req, res) => {
  try {
    const accessToken = req.headers['x-google-access-token'];
    if (!accessToken) {
      return res
        .status(400)
        .json({ success: false, message: 'Google access token missing' });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const people = google.people({ version: 'v1', auth });
    const response = await people.people.connections.list({
      resourceName: 'people/me',
      pageSize: 300,
      personFields: 'names,phoneNumbers',
    });

    const connections = response.data.connections || [];
    const contacts = connections
      .map((c) => {
        const name = c.names?.[0]?.displayName || '';
        const phone = c.phoneNumbers?.[0]?.value || '';
        return { name, phone };
      })
      .filter((c) => c.name && c.phone);

    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error('Contacts API Error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch Google contacts' });
  }
};
