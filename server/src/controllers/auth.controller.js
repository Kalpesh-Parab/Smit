import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage', // Required for offline authorization code exchange via popup
);

// In-memory token store (or attach to a User document in MongoDB)
let storedRefreshToken = null;

export const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: 'Authorization code is required' });
    }

    // Exchange auth code for tokens (includes refresh_token on initial consent)
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (tokens.refresh_token) {
      storedRefreshToken = tokens.refresh_token;
    }

    // Fetch Google profile
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const user = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    // Sign session JWT valid for 30 Days (maximum reliable session)
    const sessionToken = jwt.sign(
      user,
      process.env.JWT_SECRET || 'smit_secret_key',
      {
        expiresIn: '30d',
      },
    );

    // 30 Days in milliseconds
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    res.cookie('smit_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: THIRTY_DAYS,
    });

    res.status(200).json({
      success: true,
      user,
      token: sessionToken,
      googleAccessToken: tokens.access_token,
    });
  } catch (error) {
    console.error('[Google Auth Error]:', error);
    res
      .status(401)
      .json({ success: false, message: 'Google authentication failed' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const token =
      req.cookies?.smit_token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(200).json({ success: true, user: null });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'smit_secret_key',
    );

    // Retrieve fresh Google access token using the stored refresh token
    let freshGoogleAccessToken = null;
    if (storedRefreshToken) {
      oauth2Client.setCredentials({ refresh_token: storedRefreshToken });
      const { credentials } = await oauth2Client.refreshAccessToken();
      freshGoogleAccessToken = credentials.access_token;
    }

    res.status(200).json({
      success: true,
      user: decoded,
      googleAccessToken: freshGoogleAccessToken,
    });
  } catch {
    res.status(200).json({ success: true, user: null });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('smit_token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
