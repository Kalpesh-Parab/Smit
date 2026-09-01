import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res
        .status(400)
        .json({ success: false, message: 'No credential provided' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const user = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    const token = jwt.sign(user, process.env.JWT_SECRET || 'smit_secret_key', {
      expiresIn: '7d',
    });

    res.cookie('smit_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, user, token });
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
    res.status(200).json({ success: true, user: decoded });
  } catch {
    res.status(200).json({ success: true, user: null });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('smit_token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
